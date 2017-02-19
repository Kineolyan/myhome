import React from 'react';
import _ from 'lodash';
import {connect} from 'react-redux';

import actions from '../redux/actions';
import TransactionsView from './TransactionsView';

class ReduxTransactions extends React.Component {
	componentDidMount() {
		this.props.query(this.props.viewId);
	}

	componentWillUnmount() {
		this.props.stopQuery(this.props.view);
	}

	render() {
		return <TransactionsView transactions={this.props.transactions}/>;
	}
}

ReduxTransactions.propTypes = {
	viewId: React.PropTypes.string.isRequired,
	transactions: React.PropTypes.array,
	query: React.PropTypes.func.isRequired,
	stopQuery: React.PropTypes.func.isRequired
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
	query(viewId) {
		return dispatch({
			type: actions.transactions.query,
			queryId: viewId
		});
	},
	stopQuery() {}
});

export default connect(mapStateToProps, mapDispatchToProps)(ReduxTransactions);
export {
	ReduxTransactions
};