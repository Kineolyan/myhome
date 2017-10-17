import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {connect} from 'react-redux';

import actions from '../redux/actions';
import {getStateValues} from '../redux/horizonStore';

class AccountList extends React.Component {
  get feed() {
    return this.context.horizons.accounts;
  }

  componentWillMount() {
    this.props.listAccounts();
  }

  deleteAccount(account) {
    const aId = account.id;
    this.feed.remove(aId)
      .subscribe(
        () => {
          console.log('Account removed');
          const transactionFeed = this.context.horizons.transactions;
          transactionFeed
            .findAll({accountId: aId})
            .fetch()
            .mergeMap(transactions => transactionFeed.removeAll(transactions))
            .subscribe(
              () => console.log(`Transactions of account ${account.name}`),
              err => console.error(`Failed to unlink transactions`, err));
        },
        err => console.error('Failed to delete account', account, err));
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

AccountList.contextTypes = {
  horizons: PropTypes.object
};

const ACCOUNT_QUERY_ID = 'accountList';
const mapStateToProps = (state, props) => {
  const accounts = getStateValues(state.accounts, ACCOUNT_QUERY_ID);

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
