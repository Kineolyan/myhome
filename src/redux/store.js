// @flow
import actions from './actions';
import * as horizonStore from './horizonStore';
import * as editorStore from './editorStore';

type HorizonIdType = string;
type ObjectMappingType = { [HorizonIdType]: any };
type QueryMappingType = { [HorizonIdType]: string[] };
type StoreType = {
  values: ObjectMappingType,
  queries: QueryMappingType
}
export type StateType = {
  transactions: StoreType,
  categories: StoreType,
  accounts: StoreType,
  groups: StoreType,
  templates: StoreType,
  editors: any
}

const initialState: StateType = {
  transactions: horizonStore.makeStore(),
  categories: horizonStore.makeStore(),
  accounts: horizonStore.makeStore(),
  templates: horizonStore.makeStore(),
  groups: horizonStore.makeStore(),
  editors: editorStore.makeStore()
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
        accounts: horizonStore.storeState(state.accounts, actions.accounts, action),
        transactions: horizonStore.storeState(state.transactions, actions.transactions, action),
        templates: horizonStore.storeState(state.templates, actions.templates, action),
        categories: horizonStore.storeState(state.categories, actions.categories, action),
        editors: editorStore.storeState(state.editors, action)
      };
  }
}

export default appState;