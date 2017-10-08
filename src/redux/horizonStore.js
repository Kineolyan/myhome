import _ from 'lodash';

function makeStore() {
  return {
    values: {},
    queries: {}
  };
}

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

function getStateValues(storeState, queryId) {
	return _(storeState.queries[queryId])
		.map(id => storeState.values[id])
		.filter(value => value !== undefined)
		.value();
}

export {
  storeState,
  makeStore,
  getStateValues
};