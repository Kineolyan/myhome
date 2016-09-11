import React from 'react';
import _ from 'lodash';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import DatePicker from 'material-ui/DatePicker';

import AccountPicker from '../AccountPicker';
import AccountBalance from './AccountBalance';
import TransactionsView from '../../transactions/TransactionsView';

const TODAY = new Date();

class AccountValidator extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			account: null,
			lastValidation: null,
			balance: null,
			validationDate: TODAY
		};

		this.cbks = {
			setAccount: this.setAccount.bind(this),
			setBalance: this.setBalance.bind(this),
			setValidationDate: this.setValidationDate.bind(this),
			validate: this.validate.bind(this)
		}
	}

	get validationFeed() {
		return this.context.horizons.validations;
	}

	get transactionFeed() {
		return this.context.horizons.transactions;
	}

	setAccount(account) {
		this.setState({account});
		this.transactionFeed.findAll({account})
			.order('date', 'descending')
			.watch()
			.subscribe(
				transactions => this.setState({transactions}),
				error => console.error('[Failure]', 'Fetch transactions', error)
			)
	}

	setBalance(event, value) {
		this.setState({balance: parseFloat(value)});
	}

	setValidationDate(event, date) {
		this.setState({validationDate: date});
	}

	validate() {
		const validation = {
			account: this.state.account,
			balance: this.state.balance,
			validatedAt: Date.now(),
			validationDate: this.state.validationDate.getTime()
		};
		this.validationFeed.store(validation).subscribe(
			() => console.log('Account balanced validated'),
			error => console.error('[Failure] Account validation', error)
		);
	}

	renderTransactions() {
		if (!_.isEmpty(this.state.transactions)) {
			// Group transactions by date
			const lastWeek = new Date();
			lastWeek.setDate(TODAY.getDate() - 7);
			lastWeek.setHours(0);
			lastWeek.setMinutes(0);
			lastWeek.setSeconds(0);
			lastWeek.setMilliseconds(0);

			const groups = _(this.state.transactions)
				.filter(transaction => transaction.date >= lastWeek)
				.groupBy(transaction => new Date(transaction.date).toLocaleDateString())
				.value();
			const oldTransactions = _.filter(this.state.transactions, transaction => transaction.date < lastWeek);
			if (!_.isEmpty(oldTransactions)) {
				groups.Before = oldTransactions;
			}

			return <div>
				{_.map(groups, (transactions, date) => {
					return <div key={date}>
						<div style={{fontWeight: 'bold'}}>
							{date}
							{date !== 'Before' ? <AccountBalance account={this.state.account} date={date} /> : null}
						</div>
						<TransactionsView transactions={transactions} />
					</div>;
				})}
			</div>;
		}
	}

	render() {
		return <div>
			<div>
				Solde du compte <AccountPicker value={this.state.account}
					onSelect={this.cbks.setAccount} />
				à hauteur de <TextField type="number" hintText="Solde du compte"
					value={this.state.balance}
					onChange={this.cbks.setBalance} />
				au <DatePicker hintText="Date"
							value={this.state.validationDate}
							maxDate={TODAY}
							onChange={this.cbks.setValidationDate}
							autoOk={true} style={{display: 'inline-block'}}/>
				<RaisedButton label="Valider" primary={true}
					onTouchTap={this.cbks.validate}/>
			</div>
			<div>
				{this.state.account ? <AccountBalance account={this.state.account}/> : null}
				{this.renderTransactions()}
			</div>
		</div>;
	}

}

AccountValidator.contextTypes = {
	horizons: React.PropTypes.shape({
		validations: React.PropTypes.object,
		transactions: React.PropTypes.object
	})
};

export default AccountValidator;