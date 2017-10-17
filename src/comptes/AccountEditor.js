import React from 'react';
import PropTypes from 'prop-types';
import reactStamp from 'react-stamp';
import {connect} from 'react-redux';
import _ from 'lodash';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import actions from '../redux/actions';
import {getEditedValue} from '../redux/editorStore';
import ElementEditor, {HorizonEditor} from '../core/ElementEditor';
import {StateForm} from '../core/muiForm';
import {WithHorizons} from '../core/horizon';

const AccountEditor = reactStamp(React)
  .compose(WithHorizons, ElementEditor, HorizonEditor, StateForm)
  .compose({
    propTypes: {
      account: PropTypes.object,
      editedAccount: PropTypes.object,
      editorId: PropTypes.string.isRequired,
      setUp: PropTypes.func.isRequired,
      edit: PropTypes.func.isRequired,
      clear: PropTypes.func.isRequired
    },
    defaultProps: {
      account: {}
    },
    init(props, {instance}) {
      const elementKey = 'account';
      instance.elementKey = elementKey;
      instance.formStateKey = elementKey;

      instance.setModelValue = function(key, value, acceptEmpty = false) {
        const element = {...this.props.editedAccount};
        if (!_.isEmpty(value) || acceptEmpty || value instanceof Date) {
          element[key] = value;
        } else {
          Reflect.deleteProperty(element, key);
        }
  
        this.props.edit(element);
      };
      instance.readEditedElement = function() {
        return this.props.editedAccount;
      };
    },
    componentWillMount() {
      this.props.setUp({});
      this.cbks.setName = this.setModelFromInput.bind(this, 'name');
    },
    componentWillUnmount() {
      this.props.clear();
    },
    getElementFeed() {
      return this.accountsFeed;
    },
    reset() { // Override from HorizonEditor
      this.props.edit({});
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

function mapStateToProps(state, props) {
  return {
    ...props,
    editedAccount: getEditedValue(state.editors, props.editorId, {})
  };
}

function mapDispatchToProps(dispatch, props) {
  return {
    setUp: account => dispatch({
      type: actions.editors.setup,
      editorId: props.editorId,
      value: account
    }),
    edit: account => dispatch({
      type: actions.editors.edit,
      editorId: props.editorId,
      value: account
    }),
    clear: () => dispatch({
      type: actions.editors.clear,
      editorId: props.editorId
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountEditor);
export {
  AccountEditor
};
