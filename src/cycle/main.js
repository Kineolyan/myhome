import xs from 'xstream';
import actions from '../redux/actions';

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

  const transactionQuery$ = sources.ACTION
    .filter(action => action.type === actions.transactions.query)
    .map(action => ({
      store: 'transactions',
      conditions: action.conditions,
      order: action.order,
      queryId: action.queryId
    }));

  const storeTransactions$ = sources.HORIZONS
    .filter(output => output.store === 'transactions')
    .map(response => ({
      type: actions.transactions.store,
      queryId: response.queryId,
      transactions: response.values
    }));

  const actions$ = [
    increment$, decrement$, incrementIfOdd$,
    storeTransactions$
  ];
  const mergedActions$ = actions$.reduce((merged, stream) => xs.merge(merged, stream), actions$.pop());
  const log$ = mergedActions$
    .map(action => ({action}));

  return {
    ACTION: mergedActions$,
    STATE: state$,
    HORIZONS: transactionQuery$,
    LOG: log$
  };
}

export default main;