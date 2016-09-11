import React from 'react';
import _ from 'lodash';
import reactStamp from 'react-stamp';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import DatePicker from 'material-ui/DatePicker';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import DeleteIcon from 'material-ui/svg-icons/action/delete';

import AccountPicker from '../AccountPicker';
import AccountBalance, {WithHorizons, UnvalidatedTransactions, WithStreams} from './AccountBalance';
import TransactionsView from '../../transactions/TransactionsView';

const TODAY = new Date();

const AccountValidator = reactStamp(React)
	.compose(WithHorizons, UnvalidatedTransactions, WithStreams)
	.compose({
		state: {
			account: null,
			lastValidation: null,
			balance: null,
			validationDate: TODAY
		},
		init(props, {instance}) {
			instance.cbks = {
				setAccount: instance.setAccount.bind(instance),
				setBalance: instance.setBalance.bind(instance),
				setValidationDate: instance.setValidationDate.bind(instance),
				validate: instance.validate.bind(instance),
				deleteLastValidation: instance.deleteLastValidation.bind(instance)
			};
		},
		setAccount(account) {
			this.setState({account});
			this.getValidation(account);
		},
		setBalance(event, value) {
			this.setState({balance: parseFloat(value)});
		},
		setValidationDate(event, date) {
			this.setState({validationDate: date});
		},
		getValidation(account) {
			const validationStream = this.fetchLatestValidation(account)
				.fetch().subscribe(
					([validation]) => {
						this.setState({lastValidation: validation});
						const transactionsStream = this.fetchUnvalidatedTransactions(account, validation)
							.watch().subscribe(
								transactions => this.setState({transactions}),
								error => console.error('[Failure]', 'Fetch transactions', error)
							);
						this.setStream('transactions', transactionsStream);
					},
					error => console.error('[Failure]', 'Fetch validation', error)
				);
			this.setStream('validation', validationStream);
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
		renderLastValidation() {
			if (this.state.lastValidation) {
				return <div className="last-validation">
					<div style={{float: 'right'}}>
						<FloatingActionButton primary={true} mini={true}
							onTouchTap={this.cbks.deleteLastValidation}>
								<DeleteIcon />
						</FloatingActionButton>
					</div>
					Validé le {new Date(this.state.lastValidation.validatedAt).toLocaleString()} à hauteur de {this.state.lastValidation.balance.toFixed(2)} € le {new Date(this.state.lastValidation.validationDate).toLocaleDateString()}
				</div>;
			}
		},
		renderTransactions() {
			if (!_.isEmpty(this.state.transactions)) {
				// Group transactions by date
				const lastWeek = new Date();
				lastWeek.setDate(TODAY.getDate() - 7);
				lastWeek.setHours(0, 0, 0, 0);

				const groups = _(this.state.transactions)
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
				const oldTransactions = _.filter(this.state.transactions, transaction => transaction.date < lastWeek);
				if (!_.isEmpty(oldTransactions)) {
					order.push({
						caption: 'Before',
						transactions: oldTransactions
					});
				}

				return <div>
					{_.map(order, entry => {
						return <div key={entry.date}>
							<div style={{fontWeight: 'bold'}}>
								{entry.caption}
								{entry.date ? <AccountBalance account={this.state.account} date={entry.date} /> : null}
							</div>
							<TransactionsView transactions={entry.transactions} />
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
					{this.state.account ? <AccountBalance account={this.state.account}/> : null}
					{this.renderLastValidation()}
					{this.renderTransactions()}
				</div>
			</div>;
		}
	});

export default AccountValidator;