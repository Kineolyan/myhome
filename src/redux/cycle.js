import xs from 'xstream';

function main(sources) {
  const state$ = sources.STATE;
  const isOdd$ = state$
    .map(state => state % 2 === 1)
    .take(1);

  const incrementIfOdd$ = sources.ACTION
    .filter(action => action.type === 'INCREMENT_IF_ODD')
    .map(action => isOdd$)
    .flatten()
    .filter(isOdd => isOdd)
    .mapTo({ type: 'INCREMENT' });

  const increment$ = sources.ACTION
    .filter(action => action.type === 'INCREMENT_ASYNC')
    .mapTo({ type: 'INCREMENT' });

  const decrement$ = sources.ACTION
    .filter(action => action.type === 'DECREMENT_ASYNC')
    .mapTo({ type: 'DECREMENT' });

  const actions$ = xs.merge(
    xs.merge(increment$, decrement$),
    incrementIfOdd$
  );
  const log$ = actions$
    .map(action => ({action}));

  return {
    ACTION: actions$,
    STATE: state$,
    LOG: log$
  };
}

export default main;