import xs from 'xstream';
import actions from '../redux/actions';

const Streams = {
  merge(first, ...others) {
    return others.reduce(
      (merged, stream) => xs.merge(merged, stream),
      first
    );
  }
}

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

  const transactionQuery$ = sources.ACTION
    .filter(action => action.type === actions.transactions.query)
    .map(action => Object.assign({store: 'transactions'}, action));

  const categoryQuery$ = sources.ACTION
    .filter(action => action.type === actions.categories.query)
    .map(action => Object.assign({store: 'categories'}, action));

  const accountQuery$ = sources.ACTION
    .filter(action => action.type === actions.accounts.query)
    .map(action => Object.assign({store: 'accounts'}, action));

  const storeTransactions$ = sources.HORIZONS
    .filter(output => output.store === 'transactions')
    .map(response => ({
      type: actions.transactions.store,
      queryId: response.queryId,
      transactions: response.values
    }));

  const storeCategories$ = sources.HORIZONS
    .filter(output => output.store === 'categories')
    .map(response => ({
      type: actions.categories.store,
      queryId: response.queryId,
      categories: response.values
    }));

  const storeAccounts$ = sources.HORIZONS
    .filter(output => output.store === 'accounts')
    .map(response => ({
      type: actions.accounts.store,
      queryId: response.queryId,
      accounts: response.values
    }));

  const actions$ = Streams.merge(
    storeTransactions$,
    storeCategories$,
    storeAccounts$,
    loadPage$, loadUrl$
  );

  const hQueries$ = Streams.merge(
    transactionQuery$, categoryQuery$, accountQuery$
  );

  const log$ = xs.merge(
    xs.merge(loadUrl$, actions$),
    sources.ACTION
  );

  return {
    ACTION: actions$,
    STATE: state$,
    HORIZONS: hQueries$,
    LOG: log$,
    ROUTER: changeUrl$
  };
}

export default main;