import React from 'react';
import PropTypes from 'prop-types';
import reactStamp from 'react-stamp';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import ElementEditor, {HorizonEditor} from '../core/ElementEditor';
import {StateForm} from '../core/muiForm';
import {WithHorizons} from '../core/horizon';

const AccountEditor = reactStamp(React)
  .compose(WithHorizons, ElementEditor, HorizonEditor, StateForm)
  .compose({
    propTypes: {
      account: PropTypes.object
    },
    defaultProps: {
      account: {}
    },
    state: {
      account: {}
    },
    init(props, {instance}) {
      const elementKey = 'account';
      instance.elementKey = elementKey;
      instance.formStateKey = elementKey;
    },
    getElementFeed() {
      return this.accountsFeed;
    },
    componentWillMount() {
      this.cbks.setName = this.setModelFromInput.bind(this, 'name');
    },
    render() {
      return <div>
        <div>
          <TextField defaultValue={this.props.account.name}
            hintText="Nom du compte"
            onChange={this.cbks.setName}/>
        </div>
        <div>
          <RaisedButton label="Enregistrer" primary={true}
            onClick={this.cbks.submit} />
        </div>
      </div>;
    }
  });

export default AccountEditor;
