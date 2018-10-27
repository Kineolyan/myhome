import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { Form, Input, Button } from 'antd';

import {prepareElement, submitElement} from '../core/ElementEditor';
import {setModelFromInput} from '../core/muiForm';
import {getEditedValue} from '../redux/editorStore';
import actions from '../redux/actions';

class GroupEditor extends React.Component {
  componentWillMount() {
    this.cbks = {
      setName: (...args) => setModelFromInput(
        this.props, 'editedGroup',
        newState => this.props.edit(newState.editedGroup),
        'name',
        ...args),
      submit: () => submitElement(
        prepareElement(this.props.editedGroup, {}),
        group => this.props.submit(group),
        null, null)
    };
  }

  render() {
    return (
      <Form layout="inline">
        <Form.Item>
          <Input placeholder="Nom pour le groupe de transactions"
            value={this.props.editedGroup.name || this.props.group.name}
            onChange={this.cbks.setName} />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            onClick={this.cbks.submit}>
            Ajouter
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

GroupEditor.propTypes = {
  editorId: PropTypes.string.isRequired,
  group: PropTypes.object
};

GroupEditor.defaultProps = {
  group: {}
};

function mapStateToProps(state, props) {
  const editedGroup = getEditedValue(state.editors, props.editorId, {});

  return {
    editedGroup
  };
}

function mapDispatchToProps(dispatch, props) {
  return {
    setUp: (group) => dispatch({
      type: actions.editors.setup,
      editorId: props.editorId,
      value: group
    }),
    edit: (group) => dispatch({
      type: actions.editors.edit,
      editorId: props.editorId,
      value: group
    }),
    submit: (group) => dispatch({
      type: actions.groups.save,
      value: group
    })
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupEditor);
export {
  GroupEditor
};
