import React from 'react';
import {Button} from 'antd';

import TransactionList from '../transactions/TransactionList';
import TransactionEditor from '../transactions/TransactionEditor';
import TransactionHistory from '../transactions/TransactionHistory';
import LatestTransactions from '../transactions/LatestTransactions';

class TransactionActivity extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      displayTransactions: false,
      displaySearch: false
    };

    this.cbks = {
      toggleTransactionsDisplay: this.togglePanel.bind(this, 'Transactions'),
      toggleSearchDisplay: this.togglePanel.bind(this, 'Search'),
    };
  }

  togglePanel(panel) {
    const property = `display${panel}`;
    this.setState({[property]: !this.state[property]});
  }

  getRatio(main) {
    if (this.state.displaySearch && this.state.displayTransactions) {
      return main ? '40%' : '30%';
    } else if (this.state.displaySearch || this.state.displayTransactions) {
      return '50%';
    } else {
      return '100%';
    }
  }

  renderTransactionView() {
    return <div className="block" style={{maxWidth: this.getRatio(false)}}>
      <TransactionList />
    </div>;
  }

  renderSearchView() {
    return <div className="block" style={{maxWidth: this.getRatio(false)}}>
      <TransactionHistory />
    </div>;
  }

  renderEditorView() {
    return <div className="block" style={{maxWidth: this.getRatio(true)}}>
      <TransactionEditor editorId="activity-editor"/>
      <LatestTransactions byGroup={false}/>
    </div>;
  }

  render() {
    const transactionsView = this.state.displayTransactions ?
      this.renderTransactionView() : null;
    const searchView = this.state.displaySearch ?
      this.renderSearchView() : null;

    return <div>
      <div style={{width: '100%', textAlign: 'center'}}>
        <Button
            onClick={this.cbks.toggleTransactionsDisplay}
            type={this.state.displayTransactions ? 'dashed' : undefined}>
          Transactions
        </Button> - Ajout - <Button
            onClick={this.cbks.toggleSearchDisplay}
            type={this.state.displaySearch ? 'dashed' : undefined}>
          Recherche
        </Button>
      </div>
      <div className="panel">
        {transactionsView}
        {this.renderEditorView()}
        {searchView}
      </div>
    </div>;
  }

}

export default TransactionActivity;
