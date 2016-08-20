import React from 'react';
import _ from 'lodash';

import TextField from 'material-ui/TextField';
import TransactionsView from './TransactionsView';
import AccountPicker from '../comptes/AccountPicker';

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
      const expr = new RegExp(needle, 'i');
      const selection = this.feed
        .findAll({account: account})
        .order('date', 'descending')
        .fetch()
        .defaultIfEmpty()
        .mergeMap(_.identity)
        .filter(transaction => expr.test(transaction.object))
        .toArray();

      this.setState({selection});
      console.log(`Selection changed to ${account} for ${expr}`);
    }
  }

  get feed() {
    return this.context.horizons.transactions;
  }

  render() {
    const history = this.state.selection ?
      <TransactionsView feed={this.state.selection} /> : null;

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
  horizons: React.PropTypes.object
};

export default TransactionHistory;
