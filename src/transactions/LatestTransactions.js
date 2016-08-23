import React from 'react';

import TransactionsView from './TransactionsView';

const TODAY = new Date();
TODAY.setHours(0);
TODAY.setMinutes(0);
TODAY.setSeconds(0);
TODAY.setMilliseconds(0);

class LatestTransactions extends React.Component {

  componentWillMount() {
    const selection = this.feed
      .above({updatedAt: TODAY.getTime()}, 'closed')
      .order('updatedAt', 'descending')
      .watch();
    this.setState({selection});
  }

  componentWillUnmount() {
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }

  get feed() {
    return this.context.horizons.transactions;
  }

  render() {
    return <TransactionsView feed={this.state.selection} />;
  }

}

LatestTransactions.contextTypes = {
  horizons: React.PropTypes.object
};

export default LatestTransactions;
