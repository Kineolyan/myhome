import React from 'react';
import PropTypes from 'prop-types';
import reactStamp from 'react-stamp';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import ElementEditor, {HorizonEditor} from '../core/ElementEditor';
import {StateForm} from '../core/muiForm';
import {WithHorizons} from '../core/horizon';

const GroupEditor = reactStamp(React)
  .compose(WithHorizons, ElementEditor, HorizonEditor, StateForm)
  .compose({
    propTypes: {
      group: PropTypes.object
    },
    defaultProps: {
      group: {}
    },
    state: {
      group: {}
    },
    init(props, {instance}) {
      const elementKey = 'group';
      instance.elementKey = elementKey;
      instance.formStateKey = elementKey;
    },
    getElementFeed() {
      return this.groupsFeed;
    },
    componentWillMount() {
      this.cbks.setName = this.setModelFromInput.bind(this, 'name');
    },
    render() {
      return <div>
        <TextField hintText="Nom pour le groupe de transactions"
          defaultValue={this.props.group.name}
          onChange={this.cbks.setName} />
        <RaisedButton label="Ajouter" primary={true}
          onClick={this.cbks.submit} />
      </div>;
    }
  });

export default GroupEditor;
