import Rx from 'rxjs';

function main(sources) {
  const state$ = sources.STATE;
  const isOdd$ = state$
    .map(state => state % 2 === 1)
    .take(1);

  const incrementIfOdd$ = sources.ACTION
    .filter(action => action.type === 'INCREMENT_IF_ODD')
    .mergeMap(action => isOdd$)
    .filter(isOdd => isOdd)
    .mapTo({ type: 'INCREMENT' });

  const increment$ = sources.ACTION
    .filter(action => action.type === 'INCREMENT_ASYNC')
    .mapTo({ type: 'INCREMENT' });

  const decrement$ = sources.ACTION
    .filter(action => action.type === 'DECREMENT_ASYNC')
    .mapTo({ type: 'DECREMENT' });

  return {
    ACTION: Rx.Observable.merge(increment$, decrement$, incrementIfOdd$)
  }
}

export default main;