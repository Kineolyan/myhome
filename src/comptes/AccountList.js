import React from 'react';
import _ from 'lodash';
import {connect} from 'react-redux';

import actions from '../redux/actions';

class AccountList extends React.Component {
  componentWillMount() {
    this.props.listAccounts();
  }

  render() {
    if (_.isEmpty(this.props.accounts)) {
      return <p>No account listed</p>;
    }

    return <ul>
      {this.props.accounts.map(account => {
        return <li key={account.id}>
          {account.name}
        </li>;
      })}
    </ul>;
  }
}

const ACCOUNT_QUERY_ID = 'accountList';
const mapStateToProps = (state, props) => {
  const accounts = _(state.categories.queries[ACCOUNT_QUERY_ID])
    .map(aId => state.accounts.values[aId])
    .filter(category => category)
    .value();

  return {
    ...props,
    accounts
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

export default connect(mapStateToProps, mapDispatchToProps)(AccountList);
export {
  AccountList
};
