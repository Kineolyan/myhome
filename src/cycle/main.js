import xs from 'xstream';
import actions from '../redux/actions';
import {Operations} from '../cycle/HorizonDriver';

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

  const updates$ = actions.save === undefined
    ? xs.empty()
    : sources.ACTION
      .filter(action => action.type === actions.save)
      .map(action => ({
        mode: Operations.STORE,
        store,
        queryId: action.queryId,
        values: action.values
      }));

  return {
    queries: queries$,
    values: values$,
    updates: updates$
  };
}

function deleteAccount(sources) {
  const DELETED_ACCOUNT = 'deleted_account';

  const deleteQuery$ = sources.ACTION
    .filter(action => action.type === actions.accounts.delete)
    .map(action => ({
      store: 'accounts',
      mode: Operations.DELETE,
      queryId: action.queryId,
      value: action.accountId,
      category: DELETED_ACCOUNT,
      context: {accountId: action.accountId}
    }));

  const listAccountTransactions$ = sources.HORIZONS
    .filter(response => {
      return response.category === DELETED_ACCOUNT
        && response.mode === Operations.DELETE;
    })
    .map(response => {
      console.log('Account removed');
      return {
        store: 'transactions',
        mode: Operations.FETCH,
        queryId: `listing-transactions-to-delete-for-${response.context.accountId}`,
        conditions: {accountId: response.context.accountId},
        category: DELETED_ACCOUNT,
        context: response.context
      };
    });

  const deleteAccountTransactions$ = sources.HORIZONS
    .filter(response => {
      return response.category === DELETED_ACCOUNT
        && response.mode === Operations.FETCH;
    })
    .map(response => ({
      store: 'transactions',
      mode: Operations.DELETE,
      queryId: `deleting-account-transactions-for-${response.context.accountId}`,
      values: response.values,
      category: DELETED_ACCOUNT
    }));

  return {
    HORIZONS: Streams.merge(
      deleteQuery$,
      listAccountTransactions$,
      deleteAccountTransactions$)
  };
}

function deleteTemplate(sources) {
  const DELETED_TEMPLATE = 'deleted_template';

  const deleteQuery$ = sources.ACTION
    .filter(action => action.type === actions.templates.delete)
    .map(action => ({
      store: 'templates',
      mode: Operations.DELETE,
      queryId: action.queryId,
      value: action.templateId,
      category: DELETED_TEMPLATE
    }));

  const listTransactions$ = sources.HORIZONS
    .filter(response => {
      return response.category === DELETED_TEMPLATE
        && response.mode === Operations.DELETE;
    })
    .map(response => {
      console.log('Template removed');
      return {
        store: 'transactions',
        mode: Operations.FETCH,
        queryId: `listing-transactions-with-template-${response.value}`,
        conditions: {templateId: response.value},
        category: DELETED_TEMPLATE,
        context: {templateId: response.value}
      };
    });

  const updateTransactions$ = sources.HORIZONS
    .filter(response => {
      return response.category === DELETED_TEMPLATE
        && response.mode === Operations.FETCH;
    })
    .map(response => ({
      store: 'transactions',
      mode: Operations.UPDATE,
      queryId: `untemplate-transactions-for-${response.context.templateId}`,
      values: response.values.map(transaction => ({
        id: transaction.id,
        templateId: null
      })),
      category: DELETED_TEMPLATE
    }));

  return {
    HORIZONS: Streams.merge(
      deleteQuery$,
      listTransactions$,
      updateTransactions$)
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
  const templates$ = hzStoreReader(sources, 'templates', actions.templates);
  const accounts$ = hzStoreReader(sources, 'accounts', actions.accounts);
  const opsOnDeletedAccounts$ = deleteAccount(sources);
  const opsOnDeletedTemplate$ = deleteTemplate(sources);

  const actions$ = Streams.merge(
    transactions$.values,
    categories$.values,
    templates$.values,
    accounts$.values,
    loadPage$, loadUrl$
  );

  const hQueries$ = Streams.merge(
    transactions$.queries,/* transactions$.updates,*/
    categories$.queries, categories$.updates,
    templates$.queries, /*templates$.updates,*/
    accounts$.queries, accounts$.updates,
    opsOnDeletedAccounts$.HORIZONS,
    opsOnDeletedTemplate$.HORIZONS
  );

  const log$ = Streams.merge(
    // loadUrl$.map(a => ({_stream: 'loadUrl', ...a})),
    // hQueries$.map(a => ({_stream: 'hQuery', ...a})),
    actions$.map(a => ({_stream: 'sinkActions', ...a})),
    sources.ACTION.map(a => ({_stream: 'sourceActions', ...a}))
    // sources.HORIZONS.map(a => ({_stream: 'hResponse', ...a}))
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