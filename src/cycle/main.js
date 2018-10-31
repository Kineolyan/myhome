import xs from 'xstream';
import actions from '../redux/actions';
import {Operations} from '../cycle/HorizonDriver';
import * as TemplateActivity from '../activities/TemplateActivity';
import * as AccountActivity from '../activities/AccountActivity';
import * as AccountExportActivity from '../activities/AccountExportActivity';

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
        conditions: {account: response.context.accountId},
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
        conditions: {templateId: response.value},
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
      values: response.values.map(transaction => {
        return {
        id: transaction.id,
        templateId: null
      };}),
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
      // Create a new pre-filled template
      const template = {...transaction};
      ['id', 'date', 'templateId', 'createdAt', 'updatedAt'].forEach(
        prop => Reflect.deleteProperty(template, prop));

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

  const updateTransaction$ = sources.HORIZONS
    .filter(operation => operation.category === MAKE_TEMPLATE
        && operation.store === 'templates'
        && operation.mode === Operations.STORE)
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
    HORIZONS: Streams.merge(createTemplate$, updateTransaction$)
  };
}

const routing = (sources) => {
  const loadPage$ = sources.ROUTER
    .map((url = '') => {
      const parts = url.split('/');
      parts.shift(); // Pop the first /
      if (parts[0] === 'comptes') {
        if (parts[1] === 'templates') {
          const id = parts[2];
          return {
            type: actions.activities.templates,
            context: {id}
          };
        } else {
          const section = parts[1];
          let type;
          switch (section) {
          case 'export':
            type = actions.activities.export;
            break;
          case 'edit':
            type = actions.activities.transactions;
            break;
          default:
            type = actions.activities.accounts;
          }
          return {type};
        }
      } else {
        // Always redirect to showcase
        return {
          type: actions.activities.showcase
        };
      }
    });

  const changeUrl$ = sources.ACTION
    .filter(action => action.type === actions.location.goto)
    .map(({context}) => {
      switch (context.entity) {
      case 'comptes': {
        let url = '/comptes';
        if (context.section) {
          url += `/${context.section}`;
        }
        return url;
      }
      case 'templates': {
        let url = '/comptes/templates';
        if (context.id) {
          url += `/${context.id}`;
        }
        return url;
      }
      case 'showcase': return '/showcase';
      default: throw new Error(`Unsupported entity ${context.entity} in ${context}`);
      }
    });

  return {
    ACTION: loadPage$,
    ROUTER: changeUrl$
  };
};

const makeView = ({ACTION: action$}) => {
  const registry = [
    TemplateActivity.register(),
    AccountActivity.register(),
    AccountExportActivity.register()
  ].reduce(
    (acc, {id, load, unload}) => {
      if (!Reflect.has(acc, id)) {
        // New unique id, process
        const templateLoad$ = action$
          .filter((action) => actions.activities[id] === action.type)
          .map(_ => {
            const operations = [];
            let accept = true;
            const streamDispatch = (action) => { 
              if (accept) {
                operations.push(action); 
              } else {
                console.error('Cannot call this dispatcher asynchronously');
              }
            };
            
            load(streamDispatch);
            accept = false;

            return xs.of(...operations);
          })
          .flatten();
        acc[id] = {
          ACTION: templateLoad$
        };
      } else {
        console.error('Cannot register twice the view', id);
      }

      return acc;
    },
    {});
  
  return {
    ACTION: Streams.merge(...Object.values(registry).map(r => r.ACTION))
  };
};

function main(sources) {
  const state$ = sources.STATE;

  const routes$ = routing(sources);

  const transactions$ = hzStore(sources, 'transactions', actions.transactions);
  const categories$ = hzStore(sources, 'categories', actions.categories);
  const templates$ = hzStore(sources, 'templates', actions.templates);
  const accounts$ = hzStore(sources, 'accounts', actions.accounts);
  const groups$ = hzStore(sources, 'groups', actions.groups);
  const opsOnDeletedAccounts$ = deleteAccount(sources);
  const opsOnDeletedTemplate$ = deleteTemplate(sources);
  const opsToMakeTemplate$ = makeTemplate(sources);
  const views$ = makeView(sources);

  const actions$ = Streams.merge(
    transactions$.ACTION,
    categories$.ACTION,
    templates$.ACTION,
    accounts$.ACTION,
    groups$.ACTION,
    routes$.ACTION,
    views$.ACTION
  );

  const hQueries$ = Streams.merge(
    transactions$.HORIZONS,
    Streams.merge( // Only queries and updates
      categories$.queries,
      categories$.updates),
    Streams.merge(
      templates$.queries,
      templates$.updates,
      opsOnDeletedTemplate$.HORIZONS), // Special delete
    Streams.merge(
      accounts$.queries,
      accounts$.updates,
      opsOnDeletedAccounts$.HORIZONS), // Special delete
    groups$.HORIZONS,
    opsToMakeTemplate$.HORIZONS
  );

  const log$ = Streams.merge(
    // loadUrl$.map(a => ({_stream: 'loadUrl', ...a})),
    // hQueries$.map(a => ({_stream: 'hQuery', ...a})),
    // sources.HORIZONS.map(a => ({_stream: 'hResponse', ...a})),
    // actions$.map(a => ({_stream: 'sinkActions', ...a})),
    sources.ACTION.map(a => ({_stream: 'sourceActions', ...a}))
  );

  return {
    ACTION: actions$,
    STATE: state$,
    HORIZONS: hQueries$,
    LOG: log$,
    ROUTER: routes$.ROUTER
  };
}

export default main;