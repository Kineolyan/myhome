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

  /* for http

  const getRandomUser$ = sources.DOM.select('.get-random').events('click')
    .map(() => {
      const randomNum = Math.round(Math.random() * 9) + 1;
      return {
        url: 'http://jsonplaceholder.typicode.com/users/' + String(randomNum),
        category: 'users',
        method: 'GET'
      };
    });

  const user$ = sources.HTTP.select('users')
    .flatten()
    .map(res => res.body)
    .startWith(null);

  const vdom$ = user$.map(user =>
    div('.users', [
      button('.get-random', 'Get random user'),
      user === null ? null : div('.user-details', [
        h1('.user-name', user.name),
        h4('.user-email', user.email),
        a('.user-website', {attrs: {href: user.website}}, user.website)
      ])
    ])
  );

  return {
    DOM: vdom$,
    HTTP: getRandomUser$
  };
  */

  const transactionQuery$ = sources.ACTION
    .filter(action => action.type === 'GET_TRANSACTIONS')
    .map(action => ({
      store: 'transactions',
      conditions: action.conditions,
      order: action.order
    }));

  const storeTransactions$ = sources.HORIZONS
    .filter(output => output.store === 'transactions')
    .map(response => ({
      type: 'STORE_TRANSACTIONS',
      query: response.query,
      transactions: response.value
    }));

  const actions$ = [
    increment$, decrement$, incrementIfOdd$,
    storeTransactions$
  ];
  const log$ = actions$
    .map(action => ({action}));

  return {
    ACTION: actions$.reduce(xs.merge, actions$.pop()),
    STATE: state$,
    HORIZONS: transactionQuery$,
    LOG: log$
  };
}

export default main;