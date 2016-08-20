import React from 'react';
import _ from 'lodash';

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import Dialog from 'material-ui/Dialog';

import TransactionPanel from './TransactionPanel';

class TransactionsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: null,
      detailledTransaction: null
    };
  }

  componentWillMount() {
    this.props.feed.subscribe(
      transactions => this.setState({transactions}),
      err => console.error('[Failure] retrieving transactions', err)
    );

    this.cbks = {
      showTransaction: this.showTransaction.bind(this),
      hideTransaction: this.hideTransaction.bind(this)
    };
  }

  showTransaction(rowId) {
    this.setState({detailledTransaction: this.state.transactions[rowId]});
  }

  hideTransaction() {
    this.setState({detailledTransaction: null});
  }

  render() {
    if (_.isEmpty(this.state.transactions)) {
      return <p>No transactions</p>;
    }

    let details;
    if (this.state.detailledTransaction !== null) {
      details = <Dialog title="Transaction"
          modal={false} open={true}
          onRequestClose={this.cbks.hideTransaction}
          autoScrollBodyContent={true}>
        <TransactionPanel transaction={this.state.detailledTransaction} />
      </Dialog>;
    }

    return <div>
      {details}
      <Table onCellClick={this.cbks.showTransaction}>
        <TableHeader displaySelectAll={false}>
          <TableRow>
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

export default TransactionsView;
