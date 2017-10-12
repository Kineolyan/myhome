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
        value: action.value
      }
    };
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
