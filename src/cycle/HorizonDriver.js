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

const Operations = {
	FETCH: 'fetch',
	STORE: 'store',
	UPDATE: 'update',
	DELETE: 'delete'
};

function getPayload(query) {
	const key = Reflect.has(query, 'value') ? 'value' : 'values';
	return {key, payload: query[key]};
}

function fetchValues(horizons, query) {
	const {store, queryId, order, conditions, filters, limit} = query;

	let queryStream = horizons[store];
	if (_.isObject(conditions) && !_.isEmpty(conditions)) {
		queryStream = queryStream.findAll(conditions);
	}

	if (query.above) {
		queryStream = queryStream.above(...query.above);
	}
	if (query.below) {
		queryStream = queryStream.below(...query.below);
	}

	if (order) {
		const [field, way] = order.split(/\s+/);
		queryStream = queryStream.order(field, way);
	}

	if (_.isInteger(limit) && limit > 0) {
		queryStream = queryStream.limit(limit);
	}

	// if (mode === 'fetch') {
	// 	queryStream = queryStream.fetch()
	// 		.defaultIfEmpty();
	// } else {
		queryStream = queryStream.watch();
	// }

	if (_.isArray(filters)) {
		queryStream = filters.filter(_.isFunction)
			.reduce(
				(stream, filter) => stream.map(
					values => values.filter(filter)
				),
				queryStream
			);
	}

	// Dispatch the result properly
	return queryStream.map(values => {
		if (order) {
			// FIXME, reorder, in case it has failed
			const [field, way] = order.split(/\s+/);
			let chain = _(values).sortBy(field);
			if (way === 'descending') {
				chain = chain.reverse();
			}
			values = chain.value();
		}

		return {store, queryId, values};
	});
}

function storeValue(horizons, {queryId, store, value}) {
	return horizons[store].store(value)
		.map(({id}) => ({
			store,
			queryId,
			value: {
				...value,
				id
			}
		}));
}

function updateValues(horizons, query) {
	const {queryId, store} = query;
	const payload = getPayload(query);
	return horizons[store].update(payload.value)
		.map(() => ({
			store,
			queryId,
			[payload.key]: payload.value,
			success: true
		}));
}

function deleteValues(horizons, query) {
	const {queryId, store} = query;
	let stream = horizons[store];
	const payload = getPayload(query);
	if (payload.key === 'value') {
		stream = stream.remove(query.value);
	} else {
		stream = stream.removeAll(query.values);
	}

	return stream.map(() => ({
		store,
		queryId,
		[payload.key]: payload.value,
		success: true
	}));
}

function contextifyStream(stream, query) {
	return stream.map(response => ({
			...response,
			mode: query.mode || Operations.FETCH,
			category: query.category,
			context: query.context || {}
		}));
}

function makeHorizonDriver(horizons) {
	return query$ => {
		const queries = new Map();
		const queriesSubject = new Rx.Subject();

		query$.addListener({
			next(query) {
				if (query.mode === Operations.FETCH || query.mode === undefined) {
					if (queries.has(query.queryId)) {
						// Stop the previous query
						queries.get(query.queryId).unsubscribe();
						queries.delete(query.queryId);
					}

					let queryStream = fetchValues(horizons, query);
					queryStream = contextifyStream(queryStream, query);
					const unsubscribe = queryStream.subscribe(queriesSubject);
					queries.set(query.queryId, unsubscribe);
				} else {
					let operationStream;
					switch (query.mode) {
					case Operations.STORE:
						operationStream = storeValue(horizons, query);
						break;
					case Operations.UPDATE:
						operationStream = updateValues(horizons, query);
						break;
					case Operations.DELETE:
						operationStream = deleteValues(horizons, query);
						break;
					case Operations.FETCH:
						throw new Error('Should not go through this branch');
					default:
						throw new Error(`Unsupported operation ${query.mode}. Query: ${query}`);
					}

					operationStream = contextifyStream(operationStream, query);
					const unsubscribe = operationStream.subscribe({
						next: (value) => queriesSubject.next(value),
						complete: () => unsubscribe(),
						onError: () => unsubscribe()
					});
				}
			},
			error(err) {
				console.error('Error on query', err);
			},
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
	makeHorizonDriver,
	Operations
};