import React from 'react';
import PropTypes from 'prop-types';
import reactStamp from 'react-stamp';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import ElementEditor, {HorizonEditor} from '../core/ElementEditor';
import {setModelFromInput} from '../core/muiForm';
import {WithHorizons} from '../core/horizon';

const ELEMENT_KEY = 'group';
const GroupEditor = reactStamp(React)
  .compose(WithHorizons, ElementEditor, HorizonEditor)
  .compose({
    propTypes: {
      group: PropTypes.object
    },
    defaultProps: {
      group: {}
    },
    state: {
      [ELEMENT_KEY]: {}
    },
    init(props, {instance}) {
      instance.elementKey = ELEMENT_KEY;
    },
    getElementFeed() {
      return this.groupsFeed;
    },
    componentWillMount() {
      this.cbks.setName = setModelFromInput.bind(
        null, 
        this.state, ELEMENT_KEY, newState => this.setState(newState),
       'name');
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
