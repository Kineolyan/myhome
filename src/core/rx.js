import _ from 'lodash';

const WithStreams = {
	init(props, {instance}) {
		instance.streams = {};
	},
	setStream(name, stream) {
		if (name in this.streams) {
			this.streams[name].unsubscribe();
		}
		this.streams[name] = stream;
	},
	componentWillUnmount() {
		_.forEach(this.streams, stream => stream.unsubscribe());
		this.streams = {};
	}
};

export {
  WithStreams
};