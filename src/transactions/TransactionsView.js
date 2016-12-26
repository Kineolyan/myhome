import React from 'react';
import _ from 'lodash';

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import CreditCardIcon from 'material-ui/svg-icons/action/credit-card';
import ChequeIcon from 'material-ui/svg-icons/action/tab';
import CoinIcon from 'material-ui/svg-icons/maps/local-atm';
import TransferIcon from 'material-ui/svg-icons/action/swap-horiz';
import Chip from 'material-ui/Chip';
import ArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import ArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import FloatingActionButton from 'material-ui/FloatingActionButton';

import {Type} from './models';
import TransactionPanel, {Mode as PanelMode} from './TransactionPanel';

const TYPE_COLUMN_STYLE = {width: 30};

class TransactionsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: this.props.transactions,
      detailledTransaction: null,
      index: 0
    };
  }

  componentWillMount() {
    this.cbks = {
      showTransaction: this.showTransaction.bind(this),
      hideTransaction: this.hideTransaction.bind(this),
      goPrevious: () => this.setState({index: this.state.index - 1}),
      goNext: () => this.setState({index: this.state.index + 1})
    };

    if (this.props.feed) {
      this.subscribeToFeed();
    }
  }

  componentWillUnmount() {
    this.unsubscribeFromFeed();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({transactions: nextProps.transactions});
  }

  componentDidUpdate(prevProps) {
    if (this.props.feed !== prevProps.feed) {
      this.subscribeToFeed();
    }
  }

  get transactionFeed() {
    return this.context.horizons.transactions;
  }

  /**
   * Gets the maximum index for pagination.
   * The contract is that state#index < maxIndex.
   * @param {Object[]} transactions - transactions to paginate
   * @return {Number} max index
   */
  getMaxIndex(transactions) {
    return _.isEmpty(transactions) ? 1 : parseInt((transactions.length - 1) / this.props.pagination, 10) + 1;
  }

  subscribeToFeed() {
    this.unsubscribeFromFeed();

    this.subscription = this.props.feed.subscribe(
      transactions => {
        this.setState({transactions: [...transactions]});

        const maxIdx = this.getMaxIndex(transactions);
        if (maxIdx <= this.state.index) {
          this.setState({index: maxIdx - 1});
        }
      },
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

  renderAmount(transaction) {
    const amount = transaction.amount || 0;
    const color = amount >= 0 ? '#a0fdbd' : '#fea4a9';

    return <Chip style={{margin: 4}} backgroundColor={color}>
      <span style={{fontSize: 13}}>{amount.toFixed(2)} €</span>
    </Chip>;
  }

  renderRows() {
    const startIdx = this.state.index * this.props.pagination;
    const endIdx = Math.min(startIdx + this.props.pagination, this.state.transactions.length);

    const rows = [];
    for (let i = startIdx; i < endIdx; i += 1) {
      const transaction = this.state.transactions[i];
      rows.push(<TableRow key={transaction.id} onClick={this.cbks.goPrevious}>
        <TableRowColumn style={TYPE_COLUMN_STYLE}>{this.renderTypeIcon(transaction.type)}</TableRowColumn>
        <TableRowColumn>{transaction.object}</TableRowColumn>
        <TableRowColumn>{this.renderAmount(transaction)}</TableRowColumn>
        <TableRowColumn>
          {new Date(transaction.date).toLocaleDateString()}
        </TableRowColumn>
      </TableRow>);
    }

    return rows;
  }

  renderPrevious() {
    const enabled = this.state.index > 0;

    return <FloatingActionButton onTouchTap={this.cbks.goPrevious}
        mini={true} disabled={!enabled}>
      <ArrowUp/>
    </FloatingActionButton>;
  }

  renderNext() {
    const lastIndex = (this.state.index + 1) * this.props.pagination;
    const enabled = lastIndex < this.state.transactions.length;

    return <FloatingActionButton onTouchTap={this.cbks.goNext}
        mini={true} disabled={!enabled}>
      <ArrowDown/>
    </FloatingActionButton>;
  }

  renderPagination() {
    if (this.props.pagination < this.state.transactions.length) {
      return <div style={{
          width: 50,
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 10px 10px',
          justifyContent: 'center'
      }}>
        {this.renderPrevious()}
        <div style={{textAlign: 'center', padding: '10px 0'}}>
          {this.state.index + 1} / {this.getMaxIndex(this.state.transactions)}
        </div>
        {this.renderNext()}
      </div>;
    }
  }

  render() {
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
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <Table onCellClick={this.cbks.showTransaction} style={{flex: 1}}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn style={TYPE_COLUMN_STYLE}>Type</TableHeaderColumn>
              <TableHeaderColumn>Objet</TableHeaderColumn>
              <TableHeaderColumn>Montant</TableHeaderColumn>
              <TableHeaderColumn>Date</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
              displayRowCheckbox={false}
              showRowHover={true}
              stripedRows={true}>
            {this.renderRows()}
          </TableBody>
        </Table>
        {this.renderPagination()}
      </div>
    </div>;
  }
}

TransactionsView.propTypes = {
  feed: React.PropTypes.shape({
    subscribe: React.PropTypes.func.isRequired
  }),
  transactions: React.PropTypes.array,
  pagination: React.PropTypes.number
};

TransactionsView.defaultProps = {
  transactions: [],
  pagination: 20
};

TransactionsView.contextTypes = {
  horizons: React.PropTypes.object
};

export default TransactionsView;
