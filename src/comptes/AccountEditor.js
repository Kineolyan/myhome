import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import _ from 'lodash';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import actions from '../redux/actions';
import {getEditedValue} from '../redux/editorStore';
import {prepareElement, submitElement} from '../core/ElementEditor';
import {setModelFromInput} from '../core/muiForm';

const ELEMENT_KEY = 'account';
class AccountEditor extends React.Component {
  componentWillMount() {
    this.props.setUp({});
    this.cbks = {
      setName: setModelFromInput.bind(
        null,
        this.props,
        ELEMENT_KEY,
        newState => this.props.edit(newState[ELEMENT_KEY]),
        'name'),
      submit: this.submit.bind(this)
    };
  }

  componentWillUnmount() {
    this.props.clear();
  }

  submit() {
    submitElement(
      prepareElement(this.props.editedAccount, {}),
      (account) => this.props.saveAccount(account),
      () => this.props.clear(),
      (account) => this.props.onSubmit(account));
    this.props.edit({});
  }

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
}

AccountEditor.propTypes = {
  account: PropTypes.object,
  editedAccount: PropTypes.object,
  editorId: PropTypes.string.isRequired,
  setUp: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  clear: PropTypes.func.isRequired,
  onSubmit: PropTypes.func
};

AccountEditor.defaultProps = {
  account: {},
  onSubmit: _.noop
};

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
    }),
    saveAccount: (account) => dispatch({
      type: actions.accounts.save,
      queryId: 'save-account',
      value: account
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountEditor);
export {
  AccountEditor
};
