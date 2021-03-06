import React from 'react';
import {Button} from 'antd';

import TransactionHistory from '../transactions/TransactionHistory';
import AccountPicker from '../comptes/AccountPicker';
import AccountEditor from '../comptes/AccountEditor';
import AccountValidator from '../comptes/validations/AccountValidator';
import CategoryPicker from '../categories/CategoryPicker';
import ReduxTransactions from '../transactions/ReduxTransactions';

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
      category: null,
      query: {
        conditions: {},
        order: 'date descending',
      }
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

    this.setState({
      query: {
        order: this.state.query.order,
        conditions
      }
    });
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
        <Button
          onClick={this.cbks.clearAccount}
          size="small" shape="circle" icon="close" />&nbsp;
        <CategoryPicker value={this.state.category}
          onSelect={this.cbks.setCategory} />
        <Button
          onClick={this.cbks.clearCategory}
          size="small" shape="circle" icon="close" />&nbsp;
      </div>
      <ReduxTransactions viewId="account" pagination={20}
        query={this.state.query}/>
    </div>;
  }

  render() {
    return <div>
      <div>
        <div style={{float: 'right'}}>
          <Button
            onClick={this.cbks.toggleSearchDisplay}
            size="large" shape="circle" icon="search" />
          <Button
            onClick={this.cbks.toggleValidationDisplay}
            size="large" shape="circle" icon="pushpin" />
        </div>
        <AccountEditor editorId="account-activity-account-editor"/>
      </div>
      <div className="panel">
        {this.renderList()}
        {this.renderPanel()}
      </div>
    </div>;
  }

}

export default AccountActivity;
