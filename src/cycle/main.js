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

function hzStoreReader(sources, store, actions) {
  const queries$ = sources.ACTION
  .filter(action => action.type === actions.query)
  .map(action => ({store, ...action}));

  const values$ = sources.HORIZONS
    .filter(output => output.store === store)
    .map(response => ({
      type: actions.store,
      queryId: response.queryId,
      values: response.values
    }));

  return {
    queries: queries$,
    values: values$
  };
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

  const transactions$ = hzStoreReader(sources, 'transactions', actions.transactions);
  const categories$ = hzStoreReader(sources, 'categories', actions.categories);
  const templates$ = hzStoreReader(sources, 'transaction_templates', actions.templates);
  const accounts$ = hzStoreReader(sources, 'accounts', actions.accounts);

  const actions$ = Streams.merge(
    transactions$.values,
    categories$.values,
    templates$.values,
    accounts$.values,
    loadPage$, loadUrl$
  );

  const hQueries$ = Streams.merge(
    transactions$.queries,
    categories$.queries,
    templates$.queries,
    accounts$.queries
  );

  const log$ = Streams.merge(
    loadUrl$.map(a => ({_stream: 'loadUrl', ...a})),
    hQueries$.map(a => ({_stream: 'hQuery', ...a})),
    actions$.map(a => ({_stream: 'sinkActions', ...a})),
    sources.ACTION.map(a => ({_stream: 'sourceActions', ...a}))
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