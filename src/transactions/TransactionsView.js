import React from 'react';
import _ from 'lodash';

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import CreditCardIcon from 'material-ui/svg-icons/action/credit-card';
import ChequeIcon from 'material-ui/svg-icons/action/tab';
import CoinIcon from 'material-ui/svg-icons/maps/local-atm';
import TransferIcon from 'material-ui/svg-icons/action/swap-horiz';

import {Type} from './models';
import TransactionPanel, {Mode as PanelMode} from './TransactionPanel';

class TransactionsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: null,
      detailledTransaction: null
    };
  }

  componentWillMount() {
    this.cbks = {
      showTransaction: this.showTransaction.bind(this),
      hideTransaction: this.hideTransaction.bind(this)
    };

    this.subscribeToFeed();
  }

  componentWillUnmount() {
    this.unsubscribeFromFeed();
  }

  componentDidUpdate(prevProps) {
    if (this.props.feed !== prevProps.feed) {
      this.setState({transactions: []});
      this.subscribeToFeed();
    }
  }

  get transactionFeed() {
    return this.context.horizons.transactions;
  }

  subscribeToFeed() {
    this.unsubscribeFromFeed();

    this.subscription = this.props.feed.subscribe(
      transactions => this.setState({transactions: [...transactions]}),
      err => console.error('[Failure] retrieving transactions', err)
    );
  }

  unsubscribeFromFeed() {
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }

  showTransaction(rowId) {
    this.setState({
      detailledTransaction: this.state.transactions[rowId],
      detailViewMode: PanelMode.VIEW
    });
  }

  hideTransaction() {
    this.setState({detailledTransaction: null});
  }

  deleteTransaction() {
    const transaction = this.state.detailledTransaction;
    this.transactionFeed.remove(transaction.id);
    this.hideTransaction();
  }

  renderTypeIcon(type) {
    switch (type) {
    case Type.CARTE: return <CreditCardIcon/>;
    case Type.CHEQUE: return <ChequeIcon />;
    case Type.MONNAIE: return <CoinIcon />;
    case Type.VIREMENT: return <TransferIcon />;
    default: return <span>Unknown: {type}</span>;
    }
  }

  render() {
    const typeColumnStyle = {width: 30};

    if (_.isEmpty(this.state.transactions)) {
      return <p>No transactions</p>;
    }

    let details;
    if (this.state.detailledTransaction !== null) {
      const title = <div className="dialog-header">
        <span className="dialog-title">Transaction</span>
        <div className="dialog-actions">
          <FlatButton label="Edit" onTouchTap={() => this.setState({detailViewMode: PanelMode.EDIT})}/>
          <FlatButton label="Delete" onTouchTap={() => this.deleteTransaction()}/>
        </div>
      </div>;
      details = <Dialog title={title}
          modal={false} open={true}
          onRequestClose={this.cbks.hideTransaction}
          autoScrollBodyContent={true}>
        <TransactionPanel transaction={this.state.detailledTransaction}
          mode={this.state.detailViewMode} />
      </Dialog>;
    }

    return <div>
      {details}
      <Table onCellClick={this.cbks.showTransaction}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={typeColumnStyle}>Type</TableHeaderColumn>
            <TableHeaderColumn>Objet</TableHeaderColumn>
            <TableHeaderColumn>Montant</TableHeaderColumn>
            <TableHeaderColumn>Date</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
            displayRowCheckbox={false}
            showRowHover={true}
            stripedRows={true}>
          {this.state.transactions.map(transaction => {
            return (
              <TableRow key={transaction.id}>
                <TableRowColumn style={typeColumnStyle}>{this.renderTypeIcon(transaction.type)}</TableRowColumn>
                <TableRowColumn>{transaction.object}</TableRowColumn>
                <TableRowColumn>{transaction.amount} €</TableRowColumn>
                <TableRowColumn>
                  {new Date(transaction.date).toLocaleDateString()}
                </TableRowColumn>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>;
  }
}

TransactionsView.propTypes = {
  feed: React.PropTypes.shape({
    subscribe: React.PropTypes.func.isRequired
  }).isRequired
};

TransactionsView.contextTypes = {
  horizons: React.PropTypes.object
};

export default TransactionsView;
