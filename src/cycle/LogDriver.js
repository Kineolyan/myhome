function createLogDriver(logMessages) {
	return msg$ => {
		if (logMessages) {
			msg$.addListener({
				next(msg) {
					console.log(msg);
				}
			});
		}
	};
}

export {
	createLogDriver
};