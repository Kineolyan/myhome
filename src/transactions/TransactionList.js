import React from 'react';
import _ from 'lodash';

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

class TransactionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: []
    };
  }

  componentWillMount() {
    this.feed.order('date', 'descending')
      .limit(20)
      .watch().subscribe(
        transactions => this.setState({transactions}),
        err => console.error('[Failure] fetching transactions', err)
      );
  }

  get feed() {
    return this.context.horizons.transactions;
  }

  render() {
    if (_.isEmpty(this.state.transactions)) {
      return <p>No transactions</p>;
    }

    return <Table>
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
  </Table>;
  }
}

TransactionList.contextTypes = {
  horizons: React.PropTypes.object
};

export default TransactionList;
