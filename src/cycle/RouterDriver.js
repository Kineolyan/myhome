import xs from 'xstream';

function parseUrl(hash = '/') {
	return hash.replace(/^.*#\//, '/');
}

function makeRouterDriver() {
	return url$ => {
		let urlListener = null;

		url$.addListener({
			next(msg) {
				if (urlListener) {
					urlListener.next(msg);
				}
			}
		});

		window.addEventListener("hashchange", event => {
			if (urlListener) {
				urlListener.next(parseUrl(event.newURL));
			}
		});

		return xs.create({
			start(listener) {
				urlListener = listener;
				listener.next(parseUrl(window.location.hash));
			},
			stop() {
				urlListener = null;
			}
		});
	};
}

export {
	makeRouterDriver
};