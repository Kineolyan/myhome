import _ from 'lodash';

function setModelFromInput(state, formStateKey, udpater, key, event, value) {
  return setModelValue(state, formStateKey, udpater, key, value);
}

function setModelFromChoice(state, formStateKey, udpater, key, event, index, value) {
  return setModelValue(state, formStateKey, udpater, key, value);
}

function setModelValue(state, formStateKey, updater, key, value, acceptEmpty = false) {
  const element = {...state[formStateKey]};
  if (!_.isEmpty(value) || acceptEmpty || value instanceof Date) {
    _.set(element, key, value);
  } else {
    _.unset(element, key);
  }

  return updater({[formStateKey]: element});
}

export {
  setModelFromInput,
  setModelFromChoice,
  setModelValue
};