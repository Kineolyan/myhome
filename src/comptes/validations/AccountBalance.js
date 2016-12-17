import React from 'react';
import _ from 'lodash';
import reactStamp from 'react-stamp';

import {Type} from '../../transactions/models';

/**
 * Gets the timestamp of the next day of a given value.
 * @param {Number} date - unix timestamp in ms
 */
function nextDay(date) {
	return new Date(date).setHours(23, 59, 59, 999) + 1;
}

const WithHorizons = {
	contextTypes: {
		horizons: React.PropTypes.object
	},
	getValidationFeed() {
		return this.context.horizons.validations;
	},
	getTransactionFeed() {
		return this.context.horizons.transactions;
	}
}

const UnvalidatedTransactions = {
	fetchLatestValidation(account) {
		return this.getValidationFeed()
			.findAll({account: account})
			.order('validatedAt', 'descending')
			.limit(1);
	},
	fetchUnvalidatedTransactions(account, validation, date) {
		let stream = this.getTransactionFeed().findAll({account});
		if (validation) {
			stream = stream.above({date: nextDay(validation.validationDate)}, 'closed');
		}
		if (date) {
			stream = stream.below({date: nextDay(date)});
		}
		return stream;
	},
	fetchNewTransactions(account, validation) {
		return this.getTransactionFeed().findAll({account})
			.above({date: validation.validatedAt});
	}
};

const WithStreams = {
	init(props, {instance}) {
		instance.streams = {};
	},
	setStream(name, stream) {
		if (name in this.streams) {
			this.streams[name].unsubscribe();
		}
		this.streams[name] = stream;
	},
	componentWillUnmount() {
		_.forEach(this.streams, stream => stream.unsubscribe());
		this.streams = {};
	}
}

const AccountBalance = reactStamp(React)
	.compose(WithHorizons, UnvalidatedTransactions, WithStreams)
	.compose({
		propTypes: {
			account: React.PropTypes.string.isRequired,
			date: React.PropTypes.number
		},
		state: {
			balance: null,
			validation: null
		},
		getBalanceDate() {
			return this.props.date;
		},
		componentDidMount() {
			this.fetchValidation(this.props.account);
		},
		componentWillReceiveProps(nextProps) {
			if (this.props.account !== nextProps.account) {
				this.setState({
					balance: null,
					validation: null
				});
				this.fetchValidation(nextProps.account);
			}
		},
		fetchValidation(account) {
			const stream = this.fetchLatestValidation(account)
				.fetch().defaultIfEmpty()
				.subscribe(
					([validation]) => this.setValidation(validation),
					error => console.error('[Failure] Cannot retrieve last validation', error)
				);
			this.setStream('validation', stream);
		},
		setValidation(validation) {
			this.setState({validation});
			const date = this.props.date ? this.getBalanceDate() : null;
			const lastBalance = validation ? validation.balance : 0;
			const stream = this.fetchUnvalidatedTransactions(this.props.account, validation, date)
				.watch()
				.map(transactions => _.filter(transactions, t => t.type !== Type.MONNAIE))
				.subscribe(
					transactions => {
						const balance = lastBalance + _.sumBy(transactions, 'amount');
						this.setState({balance});
					},
					error => console.log('[Failure] Cannot compute balance', error)
				);
			this.setStream('transactions', stream);
		},
		render() {
			if (this.state.balance === null) {
				return <div>Computing ...</div>;
			}

			return <div className="account-balance">
				Solde du compte: {this.state.balance.toFixed(2)} €
			</div>;
		}
	});
// class AccountBalance extends React.Component {
// 	constructor(props) {
// 		super(props);

// 		this.state = {
// 			balance: null,
// 			validation: null
// 		};
// 		this.streams = {};
// 	}

// 	get validationFeed() {
// 		return this.context.horizons.validations;
// 	}

// 	get transactionFeed() {
// 		return this.context.horizons.transactions;
// 	}

// 	getBalanceDate() {
// 		if (_.isNumber(this.props.date)) {
// 			return this.props.date;
// 		} else if (_.isString(this.props.date)) {
// 			return new Date(this.props.date).getTime();
// 		} else { // Must be a date
// 			return this.props.date.getTime();
// 		}
// 	}

// 	componentDidMount() {
// 		this.fetchValidation(this.props.account);
// 	}

// 	componentWillReceiveProps(nextProps) {
// 		if (this.props.account !== nextProps.account) {
// 			this.setState({
// 				balance: null,
// 				validation: null
// 			});
// 			this.fetchValidation(nextProps.account);
// 		}
// 	}

// 	fetchValidation(account) {
// 		this.streams.validation = this.validationFeed
// 			.findAll({account: account})
// 			.order('validatedAt', 'descending')
// 			.limit(1)
// 			.fetch().defaultIfEmpty()
// 			.subscribe(
// 				([validation]) => this.setValidation(validation),
// 				error => console.error('[Failure] Cannot retrieve last validation', error)
// 			);
// 	}

// 	setValidation(account, validation) {
// 		this.setState({validation});
// 		let stream = this.transactionFeed
// 			.findAll({account: this.props.account});
// 		let lastBalance = 0;
// 		if (validation) {
// 			stream = stream.above({date: validation.validationDate}, 'closed');
// 			lastBalance = validation.balance;
// 		}
// 		if (this.props.date) {
// 			stream = stream.below({date: this.getBalanceDate()});
// 		}
// 		this.streams.balance = stream.watch()
// 			.filter(transaction => transaction.type !== Type.MONNAIE)
// 			.subscribe(
// 				transactions => {
// 					const balance = lastBalance + _.sumBy(transactions, 'amount');
// 					this.setState({balance});
// 				},
// 				error => console.log('[Failure] Cannot compute balance', error)
// 			);
// 	}

// 	render() {
// 		if (this.state.balance === null) {
// 			return <div>Computing ...</div>;
// 		}

// 		return <div className="account-balance">
// 			Solde du compte: {this.state.balance.toFixed(2)} €
// 		</div>;
// 	}
// }

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
export {
	WithHorizons,
	UnvalidatedTransactions,
	WithStreams
};