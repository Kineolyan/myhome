import React from 'react';
import reactStamp from 'react-stamp';

import TransactionsView from './TransactionsView';
import {WithHorizons} from '../core/horizon';

const TODAY = new Date();
TODAY.setHours(0);
TODAY.setMinutes(0);
TODAY.setSeconds(0);
TODAY.setMilliseconds(0);

const LatestTransactions = reactStamp(React)
  .compose(WithHorizons)
  .compose({
    propTypes: {
      byGroup: React.PropTypes.bool
    },
    defaultProps: {
      byGroup: true
    },
    componentWillMount() {
      const selection = this.transactionsFeed
        .above({updatedAt: TODAY.getTime()}, 'closed')
        .order('updatedAt', 'descending')
        .watch();
      this.setState({selection});
    },
    render() {
      return <TransactionsView feed={this.state.selection}
        byGroup={this.props.byGroup}/>;
    }
  });

export default LatestTransactions;
