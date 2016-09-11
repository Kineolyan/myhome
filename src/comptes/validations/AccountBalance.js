import React from 'react';
import _ from 'lodash';

import {Type} from '../../transactions/models';

class AccountBalance extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			balance: null,
			validation: null
		};
		this.streams = {};
	}

	get validationFeed() {
		return this.context.horizons.validations;
	}

	get transactionFeed() {
		return this.context.horizons.transactions;
	}

	getBalanceDate() {
		if (_.isNumber(this.props.date)) {
			return this.props.date;
		} else if (_.isString(this.props.date)) {
			return new Date(this.props.date).getTime();
		} else { // Must be a date
			return this.props.date.getTime();
		}
	}

	componentDidMount() {
		this.fetchValidation(this.props.account);
	}

	componentWillUnmount() {
		_.forEach(this.streams, stream => stream.unsubscribe());
		this.streams = {};
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.account !== nextProps.account) {
			this.setState({
				balance: null,
				validation: null
			});
			this.fetchValidation(nextProps.account);
		}
	}

	fetchValidation(account) {
		this.streams.validation = this.validationFeed
			.findAll({account: account})
			.order('validatedAt', 'descending')
			.limit(1)
			.fetch().defaultIfEmpty()
			.subscribe(
				([validation]) => this.setValidation(validation),
				error => console.error('[Failure] Cannot retrieve last validation', error)
			);
	}

	setValidation(account, validation) {
		this.setState({validation});
		let stream = this.transactionFeed
			.findAll({account: this.props.account});
		let lastBalance = 0;
		if (validation) {
			stream = stream.above({date: validation.validationDate}, 'closed');
			lastBalance = validation.balance;
		}
		if (this.props.date) {
			stream = stream.below({date: this.getBalanceDate()});
		}
		this.streams.balance = stream.watch()
			.filter(transaction => transaction.type !== Type.MONNAIE)
			.subscribe(
				transactions => {
					const balance = lastBalance + _.sumBy(transactions, 'amount');
					this.setState({balance});
				},
				error => console.log('[Failure] Cannot compute balance', error)
			);
	}

	render() {
		if (this.state.balance === null) {
			return <div>Computing ...</div>;
		}

		return <div className="account-balance">
			Solde du compte: {this.state.balance.toFixed(2)} €
		</div>;
	}
}

AccountBalance.propTypes = {
	account: React.PropTypes.string.isRequired,
	date: React.PropTypes.oneOfType([
		React.PropTypes.object,
		React.PropTypes.string,
		React.PropTypes.number
	])
}

AccountBalance.contextTypes = {
	horizons: React.PropTypes.shape({
		transactions: React.PropTypes.object,
		validations: React.PropTypes.object
	})
};

export default AccountBalance;