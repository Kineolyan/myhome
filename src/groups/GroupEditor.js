import React from 'react';
import PropTypes from 'prop-types';
import reactStamp from 'react-stamp';
import {connect} from 'react-redux';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import {prepareElement, submitElement} from '../core/ElementEditor';
import {setModelFromInput} from '../core/muiForm';
import {WithHorizons} from '../core/horizon';
import {getEditedValue} from '../redux/editorStore';
import actions from '../redux/actions';

const GroupEditor = reactStamp(React)
  .compose(WithHorizons)
  .compose({
    propTypes: {
      editorId: PropTypes.string.isRequired,
      group: PropTypes.object
    },
    defaultProps: {
      group: {}
    },
    componentWillMount() {
      this.cbks = {
        setName: (...args) => setModelFromInput(
          this.props, 'editedGroup',
          newState => this.props.edit(newState.editedGroup),
          'name', ...args),
        submit: () => submitElement(
          prepareElement(this.props.editedGroup, {}),
          group => this.props.submit(group),
          null, null)
      };
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
