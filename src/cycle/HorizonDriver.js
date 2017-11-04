import xs from 'xstream';
import Rx from 'rxjs';
import _ from 'lodash';

const Operations = {
	FETCH: 'fetch', // Fetch values to view
	SELECT: 'select', // Like fetch, but for internal operations
	STORE: 'store', // Store new values
 	UPDATE: 'update', // Update existing values
	DELETE: 'delete' // Delete values
};

function getPayload(query) {
	const key = Reflect.has(query, 'value') ? 'value' : 'values';
	return {key, value: query[key]};
}

function fetchValues(horizons, query, watch = true) {
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

	if (watch) {
		queryStream = queryStream.watch();
	} else {
		queryStream = queryStream.fetch().defaultIfEmpty();
	}

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

function storeValue(horizons, query) {
	const {queryId, store} = query;
	const payload = getPayload(query);
	return horizons[store].store(payload.value)
		.map((response) => {
			const result = _.isArray(payload.value)
				? _.zip(response, payload.value, (saved, value) => ({...value, id: saved.id}))
				: {...payload.value, id: response.id};
			return {
				store,
				queryId,
				[payload.key]: result
			};
		});
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
		stream = stream.remove(payload.value);
	} else {
		stream = stream.removeAll(payload.value);
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
				if (query.mode === Operations.FETCH || query.mode === Operations.SELECT || query.mode === undefined) {
					if (queries.has(query.queryId)) {
						// Stop the previous query
						queries.get(query.queryId).unsubscribe();
						queries.delete(query.queryId);
					}

					const continuous = query.mode !== Operations.SELECT;
					let queryStream = fetchValues(horizons, query, continuous);
					queryStream = contextifyStream(queryStream, query);
					if (continuous) {
						const unsubscribe = queryStream.subscribe(queriesSubject);
						queries.set(query.queryId, unsubscribe);
					} else {
						// TODO refactor with other operations
						queryStream.subscribe({
							next: (values) => queriesSubject.next(values)
						});
					}
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
					operationStream.subscribe({
						next: (value) => queriesSubject.next(value)
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