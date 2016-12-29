import reactStamp from 'react-stamp';
import _ from 'lodash';

const StateForm = reactStamp()
  .compose({
    setModelFromInput(key, event, value) {
      const element = this.state[this.formStateKey];
      if (!_.isEmpty(value)) {
        element[key] = value;
      } else {
        Reflect.deleteProperty(element, key);
      }

      this.setState({[this.formStateKey]: element});
    },
  });

export {
  StateForm
};