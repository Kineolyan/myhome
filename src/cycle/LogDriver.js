function createLogDriver() {
	return msg$ => {
		// msg$.addListener({
		// 	next(msg) {
		// 		console.log(msg);
		// 	}
		// });
	};
}

export {
	createLogDriver
};