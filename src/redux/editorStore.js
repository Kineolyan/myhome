import _ from 'lodash';

import actions from './actions';

function makeStore() {
  return {};
}

function shiftTransactionDate(editorState, shift) {
  const currentDate = _.get(editorState, ['value', 'date']);
  const shiftedDate = new Date(currentDate.getTime());
  shiftedDate.setDate(currentDate.getDate() + shift);

  return _.set({...editorState}, ['value', 'date'], shiftedDate);
}

function storeState(state, action) {
  switch(action.type) {
  case actions.editors.setup:
  case actions.editors.edit:
    return {
      ...state,
      [action.editorId]: {
        ...state[action.editorId],
        value: _.isFunction(action.value)
          ? action.value(state[action.editorId].value)
          : action.value
      }
    };
  case actions.editors.clear:
    const newState = {...state};
    Reflect.deleteProperty(newState, action.editorId);
    return newState;
  case actions.transactions.shift:
    return {
      ...state,
      [action.editorId]: shiftTransactionDate(state[action.editorId], action.shift)
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
