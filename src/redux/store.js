// @flow
import actions from './actions';
import {makeStore, storeState} from './horizonStore';

type HorizonIdType = string;
type ObjectMappingType = { [HorizonIdType]: any };
type QueryMappingType = { [HorizonIdType]: string[] };
type StoreType = {
  values: ObjectMappingType,
  queries: QueryMappingType
}
export type StateType = {
  value: number,
  transactions: StoreType,
  categories: StoreType,
  accounts: StoreType,
  templates: StoreType
}

const initialState: StateType = {
  transactions: makeStore(),
  categories: makeStore(),
  accounts: makeStore(),
  templates: makeStore()
};

/*
 * How is the next application state calculated,
 * given the current state and the action?
 */
const appState = (state: StateType = initialState, action: any) => {
  switch (action.type) {
    case actions.location.load:
      return Object.assign({}, state, {
        url: action.url
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
      return {
        ...state,
        accounts: storeState(state.accounts, actions.accounts, action),
        transactions: storeState(state.transactions, actions.transactions, action),
        templates: storeState(state.templates, actions.templates, action),
        categories: storeState(state.categories, actions.categories, action)
      };
  }
}

export default appState;