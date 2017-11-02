import reactStamp from 'react-stamp';
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
    element[key] = value;
  } else {
    Reflect.deleteProperty(element, key);
  }

  return updater({[formStateKey]: element});
}

export {
  setModelFromInput,
  setModelFromChoice,
  setModelValue
};