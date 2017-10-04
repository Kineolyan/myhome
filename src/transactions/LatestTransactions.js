import React from 'react';
import reactStamp from 'react-stamp';

import ReduxTransactions from './ReduxTransactions';

const TODAY = new Date();
TODAY.setHours(0);
TODAY.setMinutes(0);
TODAY.setSeconds(0);
TODAY.setMilliseconds(0);

const LatestTransactions = reactStamp(React)
  .compose({
    propTypes: {
      byGroup: React.PropTypes.bool
    },
    defaultProps: {
      byGroup: true
    },
    state: {
      query: {
        above: [{updatedAt: TODAY.getTime()}, 'closed'],
        order: 'updatedAt descending'
      }
    },
    render() {
      return <ReduxTransactions viewId="latest"
        query={this.state.query}
        byGroup={this.props.byGroup}/>;
    }
  });

export default LatestTransactions;
