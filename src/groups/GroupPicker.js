import React from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";

import ElementPicker from '../core/ElementPicker';
import actions from '../redux/actions';
import {getStateValues} from '../redux/horizonStore';

class GroupPicker extends React.Component {
  componentWillMount() {
    this.props.loadGroups();
  }

  render() {
    return <ElementPicker
      emptyElement={<p>No groups</p>}
      {...this.props}/>;
  }

}

GroupPicker.propTypes = {
  values: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  })),
  value: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  hintText: PropTypes.string,
  withEmpty: PropTypes.bool
};

GroupPicker.defaultProps = {
  hintText: 'Group'
};

const PICKER_QUERY_ID = 'group-picker';

function stateToProps(state, props) {
  return {
    values: getStateValues(state.groups, PICKER_QUERY_ID)
  };
}

const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);

function dispatchToProps(dispatch, props) {
  return {
    loadGroups: () => dispatch({
      type: actions.groups.query,
      queryId: PICKER_QUERY_ID,
      query: {
        above: [{createdAt: lastMonth.getTime()}, 'closed'],
        order: 'createdAt descending'
      }
    })
  };
}

export default connect(stateToProps, dispatchToProps)(GroupPicker);
