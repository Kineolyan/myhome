import _ from 'lodash';
import actions from './actions';

const initialState = {
  value: 0,
  transactions: {},
  transactionQueries: {}
};

/*
 * How is the next application state calculated,
 * given the current state and the action?
 */
const counter = (state = initialState, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return Object.assign({}, state, {value: state.value + 1});
    case 'DECREMENT':
      return Object.assign({}, state, {value: state.value - 1});
    case actions.transactions.store:
      return Object.assign({}, state, {
        transactionQueries: Object.assign(
          {}, state.transactionQueries,
          {
            [action.queryId]: action.transactions.map(t => t.id)
          }
        ),
        transactions: Object.assign(
          {}, state.transactions,
          _.keyBy(action.transactions, t => t.id)
        )
      });
    case actions.activities.transactions:
      return Object.assign({}, state, {
        view: 'transactions'
      });
    case actions.activities.accounts:
      return Object.assign({}, state, {
        view: 'accounts'
      });
    default:
      return state;
  }
}

export default counter;