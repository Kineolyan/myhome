import _ from 'lodash';

import actions from './actions';

function makeStore() {
  return {};
}

function storeState(state, action) {
  switch(action.type) {
  case actions.editors.setup:
  case actions.editors.edit:
    return {
      ...state,
      [action.editorId]: {
        ...state[action.editorId],
        value: _.isFunction(action.value) ? action.value(state[action.editorId].value) : action.value
      }
    };
  case actions.editors.clear:
    const newState = {...state};
    Reflect.deleteProperty(newState, action.editorId);
    return newState;
  default:
    return state;
  }
}

function getEditedValue(state, editorId, defaultValue) {
  return Reflect.has(state, editorId)
    ? state[editorId].value
    : defaultValue;
}

export {
  makeStore,
  storeState,
  getEditedValue
}
