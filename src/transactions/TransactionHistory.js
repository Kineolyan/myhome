import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import TextField from 'material-ui/TextField';
import AccountPicker from '../comptes/AccountPicker';
import ReduxTransactions from '../transactions/ReduxTransactions';

class TransactionHistory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      needle: null,
      account: null,
      selection: null
    };
  }

  componentWillMount() {
    this.cbks = {
      filter: _.debounce(this.setFilter.bind(this), 500),
      setAccount: this.setAccount.bind(this)
    };
  }

  setFilter(event, value) {
    this.setState({needle: value});
    if (_.isString(value) && value.length >= 3) {
      this.filterTransactions(this.state.account, value);
    } else if (_.isEmpty(value)) {
      this.setState({selection: null});
    }
  }

  setAccount(account) {
    this.setState({account});
    this.filterTransactions(account, this.state.needle);
  }

  filterTransactions(account, needle) {
    if (needle && account) {
      const conditions = {account};
      const expr = new RegExp(needle, 'i');
      const filters = [
        transaction => expr.test(transaction.object)
      ];

      const newQuery = Object.assign(
        {order: 'date descending'},
        {
          conditions,
          filters,
          mode: 'fetch'
        }
      );
      this.setState({query: newQuery});
    } else {
      this.setState({query: null});
    }
  }

  render() {
    const history = this.state.query ?
      <ReduxTransactions viewId="history"
        query={this.state.query}
        pagination={30}
        byGroup={false}/> :
      null;

    return <div>
      <div>
        <AccountPicker value={this.state.account}
          onSelect={this.cbks.setAccount} />
        <TextField hintText="Recherche"
          onChange={this.cbks.filter}/>
      </div>
      {history}
    </div>;
  }
}

TransactionHistory.contextTypes = {
  horizons: PropTypes.object
};

export default TransactionHistory;
