import React from 'react';
import _ from 'lodash';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ActionSearch from 'material-ui/svg-icons/action/search';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

import TransactionHistory from '../transactions/TransactionHistory';
import TransactionsView from '../transactions/TransactionsView';
import AccountPicker from '../comptes/AccountPicker';
import CategoryPicker from '../categories/CategoryPicker';

class AccountActivity extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      displaySearch: false,
      account: null,
      category: null
    };

    this.cbks = {
      toggleSearchDisplay: this.toggleSearchDisplay.bind(this),
      setAccount: this.setAccount.bind(this),
      clearAccount: this.setAccount.bind(this, null),
      setCategory: this.setCategory.bind(this),
      clearCategory: this.setCategory.bind(this, null)
    };
  }

  componentWillMount() {
    this.filterTransactions();
  }

  get feed() {
    return this.context.horizons.transactions;
  }

  toggleSearchDisplay() {
    this.setState({displaySearch: !this.state.displaySearch});
  }

  setAccount(account) {
    this.setState({account});
    this.filterTransactions(account, this.state.category);
  }

  setCategory(category) {
    this.setState({category});
    this.filterTransactions(this.state.account, category);
  }

  filterTransactions(account, category) {
    const conditions = {};
    if (account) {
      conditions.account = account;
    }
    if (category) {
      conditions.category = category;
    }

    let selection = _.isEmpty(conditions) ? this.feed : this.feed.findAll(conditions);
    selection = selection
      .order('date', 'descending')
      .watch()
      // .tap(values => console.log('values', values))
      // .defaultIfEmpty()
      // .mergeMap(_.identity)
      // .toArray()
      ;

    this.setState({selection});
  }

  getRatio(main) {
    if (this.state.displaySearch) {
      return main ? '55%' : '45%';
    } else {
      return '100%';
    }
  }

  renderSearchView() {
    return <div className="block" style={{maxWidth: this.getRatio(false)}}>
      <TransactionHistory />
    </div>;
  }

  renderList() {
    return <div className="block" style={{maxWidth: this.getRatio(true)}}>
      <div>
        <AccountPicker value={this.state.account}
          onSelect={this.cbks.setAccount} />
        <FloatingActionButton onTouchTap={this.cbks.clearAccount}
            mini={true} secondary={true}>
          <NavigationClose />
        </FloatingActionButton>&nbsp;
        <CategoryPicker value={this.state.category}
          onSelect={this.cbks.setCategory} />
        <FloatingActionButton onTouchTap={this.cbks.clearCategory}
            mini={true} secondary={true}>
          <NavigationClose />
        </FloatingActionButton>
      </div>
      <TransactionsView feed={this.state.selection} />
    </div>;
  }

  render() {
    const searchView = this.state.displaySearch ?
      this.renderSearchView() : null;

    return <div>
      <div style={{width: '100%', textAlign: 'right'}}>
        <FloatingActionButton onTouchTap={this.cbks.toggleSearchDisplay}
            secondary={this.state.displaySearch}>
          <ActionSearch />
        </FloatingActionButton>
      </div>
      <div className="panel">
        {this.renderList()}
        {searchView}
      </div>
    </div>;
  }

}

AccountActivity.contextTypes = {
  horizons: React.PropTypes.object
};

export default AccountActivity;
