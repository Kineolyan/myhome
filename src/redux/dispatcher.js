import actions from './actions';

const startQuery = ({dispatch, queryId}) => (query) => dispatch({
  type: actions.templates.query,
  queryId,
  ...query
});
const stopQuery = ({dispatch, queryId}) => () => {};

const setState = (dispatch) => (state) => dispatch({
  type: actions.activity.setState,
  state
});

export {
  startQuery,
  stopQuery,
  setState
};
