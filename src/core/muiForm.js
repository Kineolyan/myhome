import _ from 'lodash';

function setModelFromInput(state, formStateKey, udpater, key, event, value) {
  return setModelValue(
    state,
    formStateKey,
    udpater,
    key,
    value || event.currentTarget.value);
}

function setModelFromChoice(state, formStateKey, udpater, key, event, index, value) {
  return setModelValue(state, formStateKey, udpater, key, value);
}

function setModelValue(state, formStateKey, updater, key, value, acceptEmpty = false) {
  const element = {...state[formStateKey]};
  const current = _.get(element, key);
  if (current !== value) {
    if (!_.isEmpty(value) || acceptEmpty || value instanceof Date) {
      _.set(element, key, value);
    } else {
      _.unset(element, key);
    }
  }

  return updater({[formStateKey]: element});
}

export {
  setModelFromInput,
  setModelFromChoice,
  setModelValue
};