import React from 'react';

import ReduxTransactions from './ReduxTransactions';

class TransactionList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      query: {
        order: 'date descending',
        limit: 20
      }
    };
  }

  render() {
    return <ReduxTransactions viewId="all-listing" query={this.state.query}/>;
  }
}

export default TransactionList;
