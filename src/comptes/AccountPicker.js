// @flow

import React from 'react';
import _ from 'lodash';
import reactStamp from 'react-stamp';
import {connect} from 'react-redux';

import ElementPicker from '../core/ElementPicker';
import actions from '../redux/actions';
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
  const accounts = _(state.accountQueries[ACCOUNT_QUERY_ID])
    .map(aId => state.accounts[aId])
    .filter(category => category)
    .value();

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
