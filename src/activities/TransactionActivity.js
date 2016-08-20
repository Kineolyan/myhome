import React from 'react';
import _ from 'lodash';

import RaisedButton from 'material-ui/RaisedButton';

import TransactionList from '../transactions/TransactionList';
import TransactionEditor from '../transactions/TransactionEditor';
import TransactionHistory from '../transactions/TransactionHistory';

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

  render() {
    const transactionsView = this.state.displayTransactions ?
      <div className="block">
        <TransactionList />
      </div> : null;
    const searchView = this.state.displaySearch ?
      <div className="block">
        <TransactionHistory />
      </div> : null;

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
        <div className="block">
          <TransactionEditor />
          <div>Latest transactions</div>
        </div>
        {searchView}
      </div>
    </div>;
  }

}

export default TransactionActivity;
