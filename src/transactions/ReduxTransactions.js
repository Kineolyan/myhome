import React from 'react';
import _ from 'lodash';
import {connect} from 'react-redux';

import actions from '../redux/actions';
import TransactionsView from './TransactionsView';

class ReduxTransactions extends React.Component {
	componentDidMount() {
		this.props.startQuery(this.props.viewId, this.props.query);
	}

	componentWillUnmount() {
		this.props.stopQuery(this.props.viewId);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.viewId !== this.props.viewId) {
			this.props.stopQuery(this.props.viewId);
		}
		if (!_.isEqual(this.props.query, nextProps.query)) {
			nextProps.startQuery(nextProps.viewId, nextProps.query);
		}
	}

	render() {
		return <TransactionsView
			transactions={this.props.transactions}
			pagination={this.props.pagination}/>;
	}
}

ReduxTransactions.propTypes = {
	viewId: React.PropTypes.string.isRequired,
	transactions: React.PropTypes.array,
	startQuery: React.PropTypes.func.isRequired,
	stopQuery: React.PropTypes.func.isRequired,
	pagination: React.PropTypes.number
};

ReduxTransactions.defaultProps = {
	query: {}
};

const mapStateToProps = (state, props) => {
	const transactionsIds = state.transactionQueries[props.viewId];
	const transactions = _(transactionsIds)
		.map(tId => state.transactions[tId])
		.filter(transaction => transaction !== undefined)
		.value();

	return {
		...props,
		transactions
	};
};

const mapDispatchToProps = (dispatch) => ({
	startQuery(viewId, query) {
		return dispatch({
			type: actions.transactions.query,
			queryId: viewId,
			order: query.order,
			conditions: query.conditions
		});
	},
	stopQuery() {}
});

export default connect(mapStateToProps, mapDispatchToProps)(ReduxTransactions);
export {
	ReduxTransactions
};