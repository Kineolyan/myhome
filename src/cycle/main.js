import xs from 'xstream';
import actions from '../redux/actions';

function main(sources) {
  const state$ = sources.STATE;

  const loadPage$ = sources.ROUTER
    .map(url => {
      switch(url) {
      case '/comptes/edit':
        return {
          type: actions.activities.transactions
        };
      case '/comptes':
        return {
          type: actions.activities.accounts
        };
      default:
        return {
          type: actions.activities.showcase
        };
      }
    });

  const loadUrl$ = sources.ROUTER
    .map(url => ({
      type: actions.location.load,
      url: {
        path: url
      }
    }));

  const changeUrl$ = sources.ACTION
    .filter(action => action.type === actions.location.goto)
    .map(action => action.url);

  const isOdd$ = state$
    .map(({value}) => value % 2 === 1)
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
    storeTransactions$,
    loadPage$, loadUrl$
  ];
  const mergedActions$ = actions$.reduce((merged, stream) => xs.merge(merged, stream), actions$.pop());

  const log$ = loadUrl$;

  return {
    ACTION: mergedActions$,
    STATE: state$,
    HORIZONS: transactionQuery$,
    LOG: log$,
    ROUTER: changeUrl$
  };
}

export default main;