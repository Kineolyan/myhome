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
  view: {id: string, context?: any},
  transactions: StoreType,
  categories: StoreType,
  accounts: StoreType,
  groups: StoreType,
  templates: StoreType,
  editors: any
}

const initialState: StateType = {
  view: {id: 'showcase'},
  transactions: horizonStore.makeStore(),
  categories: horizonStore.makeStore(),
  accounts: horizonStore.makeStore(),
  templates: horizonStore.makeStore(),
  groups: horizonStore.makeStore(),
  editors: editorStore.makeStore()
};

const manageView = (state, action) => {
  for (const activity in actions.activities) {
    if (actions.activities[activity] === action.type) {
      return {
        id: activity, 
        context: action.context || {},
        state: {}
      };
    }
  }
  if (action.type === actions.activity.setState) {
    return {
      ...state,
      state: {
        ...state.state,
        ...action.state
      }
    };
  } else {
    return state;
  }
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
    default:
      return {
        ...state,
        view: manageView(state.view, action),
        accounts: horizonStore.storeState(state.accounts, actions.accounts, action),
        transactions: horizonStore.storeState(state.transactions, actions.transactions, action),
        templates: horizonStore.storeState(state.templates, actions.templates, action),
        categories: horizonStore.storeState(state.categories, actions.categories, action),
        groups: horizonStore.storeState(state.groups, actions.groups, action),
        editors: editorStore.storeState(state.editors, action)
      };
  }
}

export default appState;