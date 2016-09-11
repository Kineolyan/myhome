import React from 'react';
import _ from 'lodash';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ActionSearch from 'material-ui/svg-icons/action/search';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import DoneAllIcon from 'material-ui/svg-icons/action/done-all';

import TransactionHistory from '../transactions/TransactionHistory';
import TransactionsView from '../transactions/TransactionsView';
import AccountPicker from '../comptes/AccountPicker';
import AccountEditor from '../comptes/AccountEditor';
import AccountValidator from '../comptes/validations/AccountValidator';
import CategoryPicker from '../categories/CategoryPicker';

const Panel = {
  SEARCH: 'search',
  VALIDATION: 'validation'
};

class AccountActivity extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      displayedPanel: null,
      account: null,
      category: null
    };

    this.cbks = {
      toggleSearchDisplay: this.togglePanel.bind(this, Panel.SEARCH),
      toggleValidationDisplay: this.togglePanel.bind(this, Panel.VALIDATION),
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

  togglePanel(panel) {
    this.setState({
      displayedPanel: this.state.displayedPanel === panel ? null : panel
    });
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
      .watch();

    this.setState({selection});
  }

  getRatio(main) {
    if (this.state.displayedPanel) {
      return main ? '55%' : '45%';
    } else {
      return '100%';
    }
  }

  renderSearchView() {
    return <TransactionHistory />;
  }

  renderValidationView() {
    return <AccountValidator />;
  }

  renderPanel() {
    let cpn;
    switch (this.state.displayedPanel) {
    case Panel.SEARCH:
      cpn = this.renderSearchView();
      break;
    case Panel.VALIDATION:
      cpn = this.renderValidationView();
      break;
    default: cpn = null;
    }

    if (cpn) {
      return <div className="block" style={{maxWidth: this.getRatio(false)}}>
        {cpn}
      </div>;
    }
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
    return <div>
      <div>
        <div style={{float: 'right'}}>
          <FloatingActionButton onTouchTap={this.cbks.toggleSearchDisplay}
              secondary={this.state.displaySearch}>
            <ActionSearch />
          </FloatingActionButton>
          <FloatingActionButton onTouchTap={this.cbks.toggleValidationDisplay}
              secondary={this.state.displaySearch}>
            <DoneAllIcon />
          </FloatingActionButton>
        </div>
        <AccountEditor />
      </div>
      <div className="panel">
        {this.renderList()}
        {this.renderPanel()}
      </div>
    </div>;
  }

}

AccountActivity.contextTypes = {
  horizons: React.PropTypes.object
};

export default AccountActivity;
