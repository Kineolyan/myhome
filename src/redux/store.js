// @flow
import _ from 'lodash';
import actions from './actions';

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
  transactions: {
    values: {}, queries: {}
  },
  categories: {
    values: {}, queries: {}
  },
  accounts: {
    values: {}, queries: {}
  },
  templates: {
    values: {}, queries: {}
  }
};

function storeState(state, storeActions, action) {
  if (action.type === storeActions.store) {
    return Object.assign({}, state, {
      queries: Object.assign(
        {}, state.queries,
        {[action.queryId]: action.values.map(c => c.id)}
      ),
      values: Object.assign(
        {}, state.values,
        _.keyBy(action.values, t => t.id)
      )
    });
  } else {
    return state;
  }
}

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