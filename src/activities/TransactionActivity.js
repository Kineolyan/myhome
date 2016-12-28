import React from 'react';

import RaisedButton from 'material-ui/RaisedButton';

import TransactionList from '../transactions/TransactionList';
import TransactionEditor from '../transactions/TransactionEditor';
import TransactionHistory from '../transactions/TransactionHistory';
import LatestTransactions from '../transactions/LatestTransactions';

const TOGGLE_BUTTON_STYLE = {
  paddingLeft: 5,
  paddingRight: 5
};

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
      <TransactionEditor />
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
        <RaisedButton onTouchTap={this.cbks.toggleTransactionsDisplay}
            secondary={this.state.displayTransactions}>
          <span style={TOGGLE_BUTTON_STYLE}>Transactions</span>
        </RaisedButton> - Ajout - <RaisedButton onTouchTap={this.cbks.toggleSearchDisplay}
            secondary={this.state.displaySearch}>
          <span style={TOGGLE_BUTTON_STYLE}>Recherche</span>
        </RaisedButton>
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
