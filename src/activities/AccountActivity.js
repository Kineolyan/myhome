import React from 'react';
import {connect} from 'react-redux';
import {Button} from 'antd';

import * as dispatcher from '../redux/dispatcher';

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

const filterTransactions = (account, category) => {
  const conditions = {};
  if (account) {
    conditions.account = account;
  }
  if (category) {
    conditions.category = category;
  }

  return {
    query: {
      order: 'date descending',
      conditions
    }
  };
};

class AccountActivity extends React.Component {
  constructor(props) {
    super(props);

    this.cbks = {
      toggleSearchDisplay: this.togglePanel.bind(this, Panel.SEARCH),
      toggleValidationDisplay: this.togglePanel.bind(this, Panel.VALIDATION),
      setAccount: this.setAccount.bind(this),
      clearAccount: this.setAccount.bind(this, null),
      setCategory: this.setCategory.bind(this),
      clearCategory: this.setCategory.bind(this, null)
    };
  }

  togglePanel(panel) {
    this.props.setState({
      displayedPanel: this.props.state.displayedPanel === panel ? null : panel
    });
  }

  setAccount(account) {
    this.props.setState({account});
    this.filterTransactions(account, this.props.state.category);
  }

  setCategory(category) {
    this.props.setState({category});
    this.filterTransactions(this.props.state.account, category);
  }

  filterTransactions(account, category) {
    const newState = filterTransactions(account, category);
    this.props.setState(newState);
  }

  getRatio(main) {
    if (this.props.state.displayedPanel) {
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
    switch (this.props.state.displayedPanel) {
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
        <AccountPicker value={this.props.state.account}
          onSelect={this.cbks.setAccount} />
        <Button
          onClick={this.cbks.clearAccount}
          size="small" shape="circle" icon="close" />&nbsp;
        <CategoryPicker value={this.props.state.category}
          onSelect={this.cbks.setCategory} />
        <Button
          onClick={this.cbks.clearCategory}
          size="small" shape="circle" icon="close" />&nbsp;
      </div>
      <ReduxTransactions viewId="account" pagination={20}
        query={this.props.state.query}/>
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

const mapStateToProps = (state, props) => {
  const activityState = {
    displayedPanel: null,
    account: null,
    category: null,
    query: null,
    ...props.state
  };

	return {
		state: activityState
	};
};

const mapDispatchToProps = (dispatch, props) => ({
	setState: dispatcher.setState(dispatch)
});

const register = () => ({
  id: 'accounts',
  load(dispatch) {
    dispatcher.setState(dispatch)(filterTransactions());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountActivity);
export {
  AccountActivity,
  register
};
