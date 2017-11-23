// @flow

import React from 'react';
import reactStamp from 'react-stamp';
import {connect} from 'react-redux';

import ElementPicker from '../core/ElementPicker';
import actions from '../redux/actions';
import {getStateValues} from '../redux/horizonStore';
import type StateType from '../redux/store';

const AccountPicker = reactStamp(React)
  .compose(ElementPicker)
  .compose({
    defaultProps:   {
      hintText: 'Compte'
    },
    componentWillMount() {
      this.props.listAccounts();
    },
    renderEmpty() {
      return <div>No account</div>;
    }
  });

const ACCOUNT_QUERY_ID = 'accountPicker';
const mapStateToProps = (state: StateType, props) => {
  const accounts = getStateValues(state.accounts, ACCOUNT_QUERY_ID);

  return {
    ...props,
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
