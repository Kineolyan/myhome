import React from 'react';
import _ from 'lodash';
import reactStamp from 'react-stamp';

import {Type} from '../../transactions/models';
import {nextDay} from '../../core/time';
import {WithHorizons} from '../../core/horizon';
import {WithStreams} from '../../core/rx';

const UnvalidatedTransactions = {
	fetchLatestValidation(account, lastNth = 1) {
		const feed = this.getValidationFeed()
			.findAll({account: account})
			.order('validatedAt', 'descending')
			.limit(lastNth)
			.fetch()
			.defaultIfEmpty();

		return lastNth <= 1 ? 
			feed.map(_.last) : 
			feed.map(elements => elements[lastNth - 1]);
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
		let stream = this.getTransactionFeed().findAll({account});
		if (validation) {
			return stream.above({createdAt: validation.validatedAt}, 'open');
		} // TODO else do something bad
		return stream;
	}
};

const AccountBalance = reactStamp(React)
	.compose(WithHorizons, UnvalidatedTransactions, WithStreams)
	.compose({
		propTypes: {
			account: React.PropTypes.string.isRequired,
			validation: React.PropTypes.object,
			date: React.PropTypes.oneOfType([
				React.PropTypes.object,
				React.PropTypes.string,
				React.PropTypes.number
			])
		},
		state: {
			balance: null,
			validation: null
		},
		getBalanceDate() {
			return this.props.date;
		},
		componentDidMount() {
			if (this.props.validation) {
				this.setValidation(this.props.validation);
			} else {
				this.fetchValidation(this.props.account);
			}
		},
		componentWillReceiveProps(nextProps) {
			if (this.props.account !== nextProps.account) {
				this.setState({
					balance: null,
					validation: null
				});
				this.fetchValidation(nextProps.account);
			}
			if (nextProps.validation) {
				if (this.props.validation.id !== nextProps.validation.id) {
					this.setState({balance: null});
					this.setValidation(nextProps.validation);
				}
			} else if (this.props.validation) {
				// Validation prop was previously used
				this.setState({balance: null, validation: null});
			}
		},
		fetchValidation(account) {
			const stream = this.fetchLatestValidation(account)
				.subscribe(
					(validation) => this.setValidation(validation),
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

export default AccountBalance;
export {
	UnvalidatedTransactions,
	WithStreams
};