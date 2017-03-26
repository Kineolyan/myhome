import xs from 'xstream';
import Rx from 'rxjs';
import _ from 'lodash';

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

/*
const transactionQuery$ = sources.ACTION
	.filter(action => action.type === 'GET_TRANSACTIONS')
	.map(action => ({
		store: 'transactions',
		conditions: action.conditions,
		order: action.order,
		payload: {queryId: action.queryId}
	}));

const storeTransactions$ = sources.HORIZONS
	.filter(output => output.store === 'transactions')
	.map(response => ({
		type: 'STORE_QUERY_TRANSACTIONS',
		queryId: response.queryId,
		transactions: response.values
	}));
*/

function makeHorizonDriver(horizons) {
	return query$ => {
		const queries = new Map();
		const queriesSubject = new Rx.Subject();

		query$.addListener({
			next({store, queryId, order, conditions}) {
				if (queries.has(queryId)) {
					// Stop the previous query
					queries.get(queryId).unsubscribe();
					queries.delete(queryId);
				}

				let queryStream = horizons[store];
				if (order) {
					const [field, way] = order.split(' ');
					queryStream = queryStream.order(field, way);
				}
				if (_.isObject(conditions) && !_.isEmpty(conditions)) {
					queryStream = queryStream.findAll(conditions);
				}
				queryStream = queryStream.watch()
					.map(values => ({store, queryId, values}));

				// Multicasting the result
				const unsubscribe = queryStream.subscribe(queriesSubject);
				queries.set(queryId, unsubscribe);
			},
			error() {},
			complete() {}
		});

		return xs.create({
			start(listener) {
				// As xstream respect the same as RxJS
				this.globalSubscription = queriesSubject.subscribe(listener);
			},
			stop() {
				this.globalSubscription.unsubscribe();
			},
		});
	};
}

export {
	makeHorizonDriver
};