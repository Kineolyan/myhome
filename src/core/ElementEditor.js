import React from 'react';
import PropTypes from 'prop-types';
import reactStamp from 'react-stamp';
import _ from 'lodash';

import {auditItem} from './auditActions';
import {WithStreams} from './rx';

// Old part to delete

const ElementEditor = reactStamp(React).compose({
  propTypes: {
    onSubmit: PropTypes.func
  },
  defaultProps: {
    onSubmit: _.noop
  },
  componentWillMount() {
    this.cbks = {
      submit: this.submit.bind(this)
    };
  },
  submit() {
    const element = this.getEditedElement();
    this.save(element)
      .then(result => this.onElementSaved(result))
      .then(result => this.props.onSubmit(result))
      .catch(err => this.onFailedSubmit(err, element));
  },
  onFailedSubmit(error, element) {
    console.error('Cannot save', element, error);
  }
});

const HorizonEditor = reactStamp(React)
  .compose(WithStreams)
  .compose({
    readEditedElement() {
      return this.state[this.elementKey];
    },
    getEditedElement() {
      const element = _.clone(this.readEditedElement());
      const propElt = this.props[this.elementKey];
      if (propElt.id !== undefined) {
        element.id = propElt.id;
      }

      this.formatEditedElement(element);
      return auditItem(element);
    },
    formatEditedElement(element) {
      return element;
    },
    save(element, streamName = 'elementSaved') {
      return new Promise((resolve, reject) => {
        const action = element.id === undefined ?
          this.getElementFeed().store(element) :
          this.getElementFeed().update(element);
        const stream = action.subscribe(resolve, reject);
        this.setStream(streamName, stream);
      });
    },
    reset() {
      this.setState({ [this.elementKey]: {} });
    },
    onElementSaved(element) {
      this.reset(element);
      return element;
    }
  });

// Old part above to delete

function identity(value) {
  return value;
}

function prepareElement(editedElement, originalElement, format = identity) {
  const element = _.clone(editedElement);
  if (originalElement.id !== undefined) {
    element.id = originalElement.id;
  }

  const formatedElement = format(element);
  return auditItem(formatedElement);
}

function logFailedSubmit(error, element) {
  console.error('Cannot save', element, error);
}

function submitElement(editedElement, doSave, onElementSaved, afterSave, onFailure = logFailedSubmit) {
  return doSave(editedElement);
  // FIXME cannot do the then/catch part as there is no promise
    // .then(result => onElementSaved(result))
    // .then(result => afterSave(result))
    // .catch(err => onFailure(err, editedElement));
}

export default ElementEditor;
export {
  HorizonEditor,
  prepareElement,
  submitElement,
  logFailedSubmit
};
