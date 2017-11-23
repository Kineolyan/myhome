import React from 'react';
import _ from 'lodash';
import reactStamp from 'react-stamp';
import {connect} from 'react-redux';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import DatePicker from 'material-ui/DatePicker';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import ArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import ArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';

import actions from '../../redux/actions';
import {getStateValues} from '../../redux/horizonStore';
import {WithHorizons} from '../../core/horizon';
import {WithStreams} from '../../core/rx';
import AccountPicker from '../AccountPicker';
import AccountBalance, {UnvalidatedTransactions} from './AccountBalance';
import TransactionsView from '../../transactions/TransactionsView';

const TODAY = new Date();

const AccountValidator = reactStamp(React)
	.compose(WithHorizons, UnvalidatedTransactions, WithStreams)
	.compose({
		state: {
			account: null,
			lastValidation: null,
			balance: null,
			validationDate: TODAY,
			balanceIdx: 1
		},
		init(props, {instance}) {
			instance.cbks = {
				setAccount: instance.setAccount.bind(instance),
				setBalance: instance.setBalance.bind(instance),
				setValidationDate: instance.setValidationDate.bind(instance),
				validate: instance.validate.bind(instance),
				deleteLastValidation: instance.deleteLastValidation.bind(instance),
				previousValidation: instance.shiftValidation.bind(instance, -1),
				nextValidation: instance.shiftValidation.bind(instance, 1),
			};
		},
		setAccount(account) {
			this.setState({account});
			this.getValidation(account, this.state.balanceIdx);
		},
		setBalance(event, value) {
			this.setState({balance: parseFloat(value)});
		},
		setValidationDate(event, date) {
			this.setState({validationDate: date});
		},
		getValidation(account, balanceIdx) {
			const validationStream = this.fetchLatestValidation(account, balanceIdx)
				.subscribe(
					validation => {
						this.setState({lastValidation: validation});
						this.getTransactions(account, validation);
						this.getSuspicious(account, validation);
					},
					error => console.error('[Failure]', 'Fetch validation', error)
				);
			this.setStream('validation', validationStream);
		},
		getTransactions(account, validation) {
			const query = this.fetchUnvalidatedTransactions(account, validation);
			this.props.queryTransactions(query);
		},
		getSuspicious(account, validation) {
			if (validation) {
				const query = this.fetchNewTransactions(account, validation);
				this.props.querySuspicious(query);
			}
		},
		validate() {
			const validation = {
				account: this.state.account,
				balance: this.state.balance,
				validatedAt: Date.now(),
				validationDate: this.state.validationDate.getTime()
			};
			this.getValidationFeed().store(validation).subscribe(
				() => {
					console.log('Account balanced validated');
					this.getValidation(this.state.account);
				},
				error => console.error('[Failure] Account validation', error)
			);
		},
		deleteLastValidation() {
			if (this.state.lastValidation) {
				this.getValidationFeed().remove(this.state.lastValidation);
				this.getValidation(this.state.account);
			}
		},
		shiftValidation(shift) {
			const balanceIdx = this.state.balanceIdx - shift;
			this.setState({balanceIdx});
			this.getValidation(this.state.account, balanceIdx);
		},
		renderPrevValidation() {
			return <FloatingActionButton primary={true} mini={true}
				onTouchTap={this.cbks.previousValidation}>
					<ArrowLeft/>
			</FloatingActionButton>;
		},
		renderNextValidation() {
			const enabled = this.state.balanceIdx > 1;
			return <FloatingActionButton primary={true} mini={true}
				onTouchTap={enabled ? this.cbks.nextValidation : _.noop}
				disabled={!enabled}>
					<ArrowRight/>
			</FloatingActionButton>;
		},
		renderBalance() {
			if (this.state.lastValidation) {
				return <AccountBalance
					account={this.state.account}
					validation={this.state.lastValidation}/>;
			}
		},
		renderLastValidation() {
			if (this.state.lastValidation) {
				return <div className="last-validation">
					<div style={{float: 'right'}}>
						<FloatingActionButton primary={true} mini={true}
							onTouchTap={this.cbks.deleteLastValidation}>
								<DeleteIcon />
						</FloatingActionButton>
						{this.renderPrevValidation()}
						{this.renderNextValidation()}
					</div>
					Validé le {new Date(this.state.lastValidation.validatedAt).toLocaleString()} à hauteur de {this.state.lastValidation.balance.toFixed(2)} € le {new Date(this.state.lastValidation.validationDate).toLocaleDateString()}
				</div>;
			}
		},
		renderTransactions() {
			if (!_.isEmpty(this.props.transactions)) {
				// Group transactions by date
				const lastWeek = new Date();
				lastWeek.setDate(TODAY.getDate() - 7);
				lastWeek.setHours(0, 0, 0, 0);

				const groups = _(this.props.transactions)
					.filter(transaction => transaction.date >= lastWeek)
					.groupBy(transaction => new Date(transaction.date).setHours(0, 0, 0, 0))
					.value();
				const order = _(groups).keys()
					.filter(key => !_.isEmpty(groups[key]))
					.map(key => parseInt(key, 10))
					.sort()
					.reverse()
					.map(key => ({
						date: key,
						caption: new Date(key).toLocaleDateString(),
						transactions: groups[key]
					}))
					.value();
				const oldTransactions = _(this.props.transactions)
					.filter(transaction => transaction.date < lastWeek)
					.sortBy(t => -t.date)
					.value();
				if (!_.isEmpty(oldTransactions)) {
					order.push({
						caption: 'Before',
						transactions: oldTransactions
					});
				}

				if (!_.isEmpty(this.props.suspicious)) {
					order.push({
						caption: 'Suspicious transactions',
						transactions: this.props.suspicious
					});
				}

				return <div>
					{_.map(order, (entry, i) => {
						return <div key={entry.date || `entry-${i}`}>
							<div style={{fontWeight: 'bold'}}>
								{entry.caption}
								{entry.date ?
									<AccountBalance
										account={this.state.account}
										date={entry.date}
										validation={this.state.lastValidation} /> :
									null
								}
							</div>
							<TransactionsView
									viewId="AccountValidator"
									transactions={entry.transactions}
									pagination={10}/>
						</div>;
					})}
				</div>;
			}
		},
		render() {
			return <div>
				<div>
					Solde du compte <AccountPicker value={this.state.account}
						onSelect={this.cbks.setAccount} />
					à hauteur de <TextField type="number" hintText="Solde du compte"
						value={this.state.balance}
						onChange={this.cbks.setBalance} />
					€ au <DatePicker hintText="Date"
								value={this.state.validationDate}
								maxDate={TODAY}
								onChange={this.cbks.setValidationDate}
								autoOk={true} style={{display: 'inline-block'}}/>
					<RaisedButton label="Valider" primary={true}
						onTouchTap={this.cbks.validate}/>
				</div>
				<div>
					{this.renderBalance()}
					{this.renderLastValidation()}
					{this.renderTransactions()}
				</div>
			</div>;
		}
	});

const mapStateToProps = (state, props) => {
	const transactions = getStateValues(state.transactions, 'validator-transactions');
	const suspicious = _.difference(
			getStateValues(state.transactions, 'validator-suspicious'),
			transactions);

	return {
		...props,
		transactions,
		suspicious
	};
};

const mapDispatchToProps = (dispatch) => ({
	queryTransactions(query) {
		return dispatch(Object.assign(
			{
				type: actions.transactions.query,
				queryId: 'validator-transactions'
			},
			query
		));
	},
	querySuspicious(query) {
		return dispatch(Object.assign(
			{
				type: actions.transactions.query,
				queryId: 'validator-suspicious'
			},
			query
		));
	},
	stopQuery() {}
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountValidator);
export {
	AccountValidator
};