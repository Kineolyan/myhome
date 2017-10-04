import reactStamp from 'react-stamp';
import _ from 'lodash';

const StateForm = reactStamp()
  .compose({
    setModelFromInput(key, event, value) {
      this.setModelValue(key, value);
    },
    setModelFromChoice(key, event, index, value) {
      return this.setModelValue(key, value);
    },
    setModelValue(key, value, acceptEmpty = false) {
      const element = this.state[this.formStateKey];
      if (!_.isEmpty(value) || acceptEmpty || value instanceof Date) {
        element[key] = value;
      } else {
        Reflect.deleteProperty(element, key);
      }

      this.setState({[this.formStateKey]: element});
    }
  });

export {
  StateForm
};