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

function hzStore(sources, store, actions) {
  const queries$ = sources.ACTION
    .filter(action => action.type === actions.query)
    .map(action => ({
      ...action,
      store,
      mode: Operations.FETCH
    }));

  const values$ = sources.HORIZONS
    .filter(output => output.store === store && output.mode === Operations.FETCH)
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
        ...action,
        mode: Operations.STORE,
        store
      }));

  const deletions$ = actions.delete === undefined
      ? xs.empty()
      : sources.ACTION
        .filter(action => action.type === actions.delete)
        .map(action => ({
          ...action,
          mode: Operations.DELETE,
          store
        }));

  return {
    queries: queries$,
    values: values$,
    updates: updates$,
    deletions: deletions$,
    HORIZONS: Streams.merge(queries$, updates$, deletions$),
    ACTION: values$
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
      // Filter on every deleted account
      return response.category === DELETED_ACCOUNT
        && response.mode === Operations.DELETE
        && response.store === 'accounts';
    })
    .map(response => {
      console.log('Account removed');
      return {
        store: 'transactions',
        mode: Operations.SELECT,
        queryId: `listing-transactions-to-delete-for-${response.context.accountId}`,
        element: response.context.accountId,
        category: DELETED_ACCOUNT,
        context: response.context
      };
    });

  const deleteAccountTransactions$ = sources.HORIZONS
    .filter(response => {
      return response.category === DELETED_ACCOUNT
        && response.mode === Operations.SELECT
        && response.store === 'transactions';
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
        && response.store === 'templates'
        && response.mode === Operations.DELETE;
    })
    .map(response => {
      console.log('Template removed');
      return {
        store: 'transactions',
        mode: Operations.SELECT,
        queryId: `listing-transactions-with-template-${response.value}`,
        element: response.value,
        category: DELETED_TEMPLATE,
        context: {templateId: response.value}
      };
    });

  const updateTransactions$ = sources.HORIZONS
    .filter(response => {
      return response.category === DELETED_TEMPLATE
        && response.store === 'transactions'
        && response.mode === Operations.SELECT;
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

function makeTemplate(sources) {
  const MAKE_TEMPLATE = 'make-template-from-transaction';

  const createTemplate$ = sources.ACTION
    .filter(action => action.type === actions.transactions.toTemplate)
    .map(action => {
      const transaction = {...action.transaction};
      const template = {
        ...transaction,
        frequency: {
          type: 'monthly'
        }
      };
      Reflect.deleteProperty(template, 'id');

      return {
        store: 'templates',
        mode: Operations.STORE,
        value: template,
        category: MAKE_TEMPLATE,
        context: {
          transaction
        }
      };
    });

  const updateTrasaction$ = sources.HORIZONS
    .filter(operation => operation.category === MAKE_TEMPLATE
        && operation.store === 'templates'
        && operation.mode === Operations.STORE
        && operation.success)
    .map(operation => {
      const transaction = operation.context.transaction;
      transaction.templateId = operation.value.id;

      return {
        store: 'transactions',
        mode: Operations.UPDATE,
        value: transaction,
        category: MAKE_TEMPLATE
      };
    });

  return {
    HORIZONS: Streams.merge(createTemplate$, updateTrasaction$)
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

  const transactions$ = hzStore(sources, 'transactions', actions.transactions);
  const categories$ = hzStore(sources, 'categories', actions.categories);
  const templates$ = hzStore(sources, 'templates', actions.templates);
  const accounts$ = hzStore(sources, 'accounts', actions.accounts);
  const groups$ = hzStore(sources, 'groups', actions.groups);
  const opsOnDeletedAccounts$ = deleteAccount(sources);
  const opsOnDeletedTemplate$ = deleteTemplate(sources);
  const opsToMakeTemplate$ = makeTemplate(sources);

  const actions$ = Streams.merge(
    transactions$.ACTION,
    categories$.ACTION,
    templates$.ACTION,
    accounts$.ACTION,
    groups$.ACTION,
    loadPage$, loadUrl$
  );

  const hQueries$ = Streams.merge(
    transactions$.HORIZONS,
    categories$.HORIZONS,
    templates$.HORIZONS,
    accounts$.HORIZONS,
    groups$.HORIZONS,
    opsOnDeletedAccounts$.HORIZONS,
    opsOnDeletedTemplate$.HORIZONS,
    opsToMakeTemplate$.HORIZONS
  );

  const log$ = Streams.merge(
    // loadUrl$.map(a => ({_stream: 'loadUrl', ...a})),
    hQueries$.map(a => ({_stream: 'hQuery', ...a})),
    sources.HORIZONS.map(a => ({_stream: 'hResponse', ...a})),
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