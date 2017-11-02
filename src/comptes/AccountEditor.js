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
import {setModelFromInput} from '../core/muiForm';
import {WithHorizons} from '../core/horizon';

const ELEMENT_KEY = 'account';
const AccountEditor = reactStamp(React)
  .compose(WithHorizons, ElementEditor, HorizonEditor)
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
      instance.elementKey = ELEMENT_KEY;

      instance.readEditedElement = function() {
        return this.props.editedAccount;
      };
    },
    componentWillMount() {
      this.props.setUp({});
      this.cbks.setName = setModelFromInput.bind(
        null,
        this.props,
        ELEMENT_KEY,
        newState => this.props.edit(newState[ELEMENT_KEY]), 
        'name');
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
