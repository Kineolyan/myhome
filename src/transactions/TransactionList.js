import React from 'react';

import TransactionsView from './TransactionsView';

class TransactionList extends React.Component {

  componentWillMount() {
    this.selection = this.feed.order('date', 'descending')
      .limit(20)
      .watch();
  }

  get feed() {
    return this.context.horizons.transactions;
  }

  render() {
    return <TransactionsView feed={this.selection} />;
  }
}

TransactionList.contextTypes = {
  horizons: React.PropTypes.object
};

export default TransactionList;
