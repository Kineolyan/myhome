import React from 'react';
import _ from 'lodash';

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

class TransactionsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: []
    };
  }

  componentWillMount() {
    this.props.feed.subscribe(
      transactions => {
        console.log('received', transactions);
        this.setState({transactions});
      },
      err => console.error('[Failure] retrieving transactions', err),
      () => console.log('Transactions loaded')
    );
    console.log('view mounted');
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

TransactionsView.propTypes = {
  feed: React.PropTypes.shape({
    subscribe: React.PropTypes.func.isRequired
  }).isRequired
};

export default TransactionsView;
