import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import ElementPicker from '../core/ElementPicker';
import actions from '../redux/actions';
import {getStateValues} from '../redux/horizonStore';

class AccountPicker extends React.Component {
  componentWillMount() {
    this.props.listAccounts();
  }

  render() {
    return <ElementPicker
      emptyElement={<div>No account</div>}
      {...this.props} />;
  }

}

AccountPicker.propTypes = {
  values: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  })),
  value: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  hintText: PropTypes.string,
  withEmpty: PropTypes.bool
};

AccountPicker.defaultProps = {
  hintText: 'Account'
};

const ACCOUNT_QUERY_ID = 'accountPicker';
const mapStateToProps = (state, props) => {
  const accounts = getStateValues(state.accounts, ACCOUNT_QUERY_ID);

  return {
    values: accounts
  };
};

const mapDispatchToProps = (dispatch) => ({
  listAccounts() {
    dispatch({
      type: actions.accounts.query,
      queryId: ACCOUNT_QUERY_ID,
      order: 'name ascending'
    });
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountPicker);
export {
  AccountPicker
};
