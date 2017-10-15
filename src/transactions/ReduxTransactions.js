import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {connect} from 'react-redux';

import actions from '../redux/actions';
import {getStateValues} from '../redux/horizonStore';
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
			pagination={this.props.pagination}
			byGroup={this.props.byGroup}/>;
	}
}

ReduxTransactions.propTypes = {
	viewId: PropTypes.string.isRequired,
	transactions: PropTypes.array,
	startQuery: PropTypes.func.isRequired,
	stopQuery: PropTypes.func.isRequired,
	pagination: PropTypes.number,
	byGroup: PropTypes.bool
};

ReduxTransactions.defaultProps = {
	query: {}
};

const mapStateToProps = (state, props) => {
	const transactions = getStateValues(state.transactions, props.viewId);

	return {
		...props,
		transactions
	};
};

const mapDispatchToProps = (dispatch) => ({
	startQuery: (viewId, query) => dispatch({
		type: actions.transactions.query,
		queryId: viewId,
		...query
	}),
	stopQuery() {}
});

export default connect(mapStateToProps, mapDispatchToProps)(ReduxTransactions);
export {
	ReduxTransactions
};