import React from 'react';
import PropTypes from 'prop-types';

import ReduxTransactions from './ReduxTransactions';

const TODAY = new Date();
TODAY.setHours(0);
TODAY.setMinutes(0);
TODAY.setSeconds(0);
TODAY.setMilliseconds(0);

const QUERY = {
  above: [{updatedAt: TODAY.getTime()}, 'closed'],
  order: 'updatedAt descending'
};

const LatestTransactions = (props) =>
  <ReduxTransactions viewId="latest"
    query={QUERY}
    byGroup={props.byGroup}/>;

LatestTransactions.propTypes = {
  byGroup: PropTypes.bool
};

LatestTransactions.defaultProps = {
  byGroup: true
};

export default LatestTransactions;
