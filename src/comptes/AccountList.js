import React from 'react';
import _ from 'lodash';

class AccountList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      accounts: []
    };
  }

  get feed() {
    return this.context.horizons.accounts;
  }

  componentWillMount() {
    this.feed
      .order('name', 'ascending')
      .watch().subscribe(
        accounts => this.setState({accounts}),
        err => console.error('Listing accounts', err)
      );
  }

  render() {
    if (_.isEmpty(this.state.accounts)) {
      return <p>No account listed</p>;
    }

    return <ul>
      {this.state.accounts.map(account => {
        return <li key={account.id}>
          {account.name}
        </li>;
      })}
    </ul>;
  }
}

AccountList.contextTypes = {
  horizons: React.PropTypes.object
};

export default AccountList;
