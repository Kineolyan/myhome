import _ from 'lodash';

/*
 * How is the next application state calculated,
 * given the current state and the action?
 */
const counter = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    case 'STORE_TRANSACTIONS':
      return Object.assign({}, state, {
        transactionQueries: Object.assign(
          {}, state.transactionQueries,
          {
            [action.query]: action.transactions.map(t => t.id)
          }
        ),
        transactions: Object.assign(
          {}, state.transactions,
          _.keyBy(action.transactions, t => t.id)
        )
      });
    default:
      return state;
  }
}

export default counter;