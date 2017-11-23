import React from 'react';
import _ from 'lodash';
import {connect} from 'react-redux';

import actions from '../redux/actions';
import {getStateValues} from '../redux/horizonStore';

class AccountList extends React.Component {

  componentWillMount() {
    this.props.listAccounts();
  }

  deleteAccount(account) {
    this.props.deleteAccount(account.id);
  }

  render() {
    if (_.isEmpty(this.props.accounts)) {
      return <p>No account listed</p>;
    }

    return <ul>
      {this.props.accounts.map(account => {
        return <li key={account.id}>
          <span onClick={() => this.deleteAccount(account)}>(x)&nbsp;</span>
          {account.name}
        </li>;
      })}
    </ul>;
  }
}

const ACCOUNT_QUERY_ID = 'accountList';
const mapStateToProps = (state, props) => {
  const accounts = getStateValues(state.accounts, ACCOUNT_QUERY_ID);

  return {
    ...props,
    accounts
  };
};

const mapDispatchToProps = (dispatch) => ({
  listAccounts: () => dispatch({
    type: actions.accounts.query,
    queryId: ACCOUNT_QUERY_ID,
    order: 'name ascending'
  }),
  deleteAccount: accountId => dispatch({
    type: actions.accounts.delete,
    queryId: `AccountList-delete-${accountId}`,
    accountId
  })
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountList);
export {
  AccountList
};
