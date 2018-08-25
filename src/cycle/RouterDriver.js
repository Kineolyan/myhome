import xs from 'xstream';

function parseUrl(hash = '/') {
	return hash.replace(/^.*#\//, '/');
}

function makeRouterDriver() {
	return url$ => {
		url$.addListener({
			next(url) {
				window.location.hash = url;
			}
		});

		return xs.create({
				eventListener: null,
				listener: null,
				start(listener) {
					this.eventListener = event => listener.next(event.newURL);
					window.addEventListener('hashchange', this.eventListener);
				},
				stop() {
					window.removeEventListener('hashchange', this.eventListener);
					this.eventListener = null;
				}
			})
			.startWith(window.location.hash)
			.map(parseUrl);
	};
}

export {
	makeRouterDriver
};