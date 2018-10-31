import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import _ from 'lodash';
import { Form, Icon, Input, Button } from 'antd';

import actions from '../redux/actions';
import {getEditedValue} from '../redux/editorStore';
import {prepareElement, submitElement} from '../core/ElementEditor';
import {setModelFromInput} from '../core/muiForm';

const ELEMENT_KEY = 'account';
class AccountEditor extends React.Component {
  componentWillMount() {
    this.props.setUp({});
    this.cbks = {
      setName: (event) => setModelFromInput(
        this.props,
        ELEMENT_KEY,
        newState => this.props.edit(newState[ELEMENT_KEY]),
        'name',
        event),
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
    return (
      <Form layout="inline">
        <Form.Item>
          <Input
            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Nom de compte"
            value={this.props.editedAccount.name || this.props.account.name}
            onChange={this.cbks.setName}/>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            onClick={this.cbks.submit}>
            Enregistrer
          </Button>
        </Form.Item>
      </Form>
    );
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
