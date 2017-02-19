import xs from 'xstream';

function makeHorizonDriver(horizon) {
	return query$ => {
		query$.addListener({
			next(query) {			},
			error() {},
			complete() {}
		});

		return xs.create({
			start: listener => {
				// do nothing
			},
			stop: () => {},
		});
	};
}

export {
	makeHorizonDriver
};