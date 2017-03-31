// @flow
import _ from 'lodash';
import actions from './actions';

type HorizonIdType = string;
type ObjectMappingType = { [HorizonIdType]: any };
type QueryMappingType = { [HorizonIdType]: string[] };
export type StateType = {
  value: number,
  transactions: ObjectMappingType,
  transactionQueries: QueryMappingType,
  categories: ObjectMappingType,
  categoryQueries: QueryMappingType,
  accounts: ObjectMappingType,
  accountQueries: QueryMappingType
}

const initialState: StateType = {
  value: 0,
  transactions: {},
  transactionQueries: {},
  categories: {},
  categoryQueries: {},
  accounts: {},
  accountQueries: {}
};

/*
 * How is the next application state calculated,
 * given the current state and the action?
 */
const counter = (state: StateType = initialState, action: any) => {
  switch (action.type) {
    case actions.location.load:
      return Object.assign({}, state, {
        url: action.url
      });
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
    case actions.categories.store:
      return Object.assign({}, state, {
        categoryQueries: Object.assign(
          {}, state.categoryQueries,
          {[action.queryId]: action.categories.map(c => c.id)}
        ),
        categories: Object.assign(
          {}, state.categories,
          _.keyBy(action.categories, t => t.id)
        )
      });
    case actions.accounts.store:
      return Object.assign({}, state, {
        accountQueries: Object.assign(
          {}, state.accountQueries,
          {[action.queryId]: action.accounts.map(c => c.id)}
        ),
        accounts: Object.assign(
          {}, state.accounts,
          _.keyBy(action.accounts, t => t.id)
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
    case actions.activities.showcase:
      return Object.assign({}, state, {
        view: 'showcase'
      });
    default:
      return state;
  }
}

export default counter;