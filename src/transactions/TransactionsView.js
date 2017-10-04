import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import reactStamp from 'react-stamp';

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
import GroupView from '../groups/GroupView';
import {WithStreams} from '../core/rx';
import {WithHorizons} from '../core/horizon';

const TYPE_COLUMN_STYLE = {
  width: 40,
  textAlign: 'center'
};

const TransactionsView = reactStamp(React)
  .compose(WithStreams, WithHorizons)
  .compose({
    propTypes: {
      feed: PropTypes.shape({
        subscribe: PropTypes.func.isRequired
      }),
      transactions: PropTypes.array,
      pagination: PropTypes.number,
      byGroup: PropTypes.bool
    },
    defaultProps: {
      transactions: [],
      pagination: 20,
      byGroup: true
    },
    init(props, {instance}) {
      instance.state = {
        transactions: props.transactions,
        detailledTransaction: null,
        index: 0
      }
    },
    componentWillMount() {
      this.cbks = {
        highlightRow: this.highlightRow.bind(this),
        hideTransaction: this.hideTransaction.bind(this),
        hideGroup: this.hideGroup.bind(this),
        goPrevious: () => this.setState({index: this.state.index - 1}),
        goNext: () => this.setState({index: this.state.index + 1}),
        openEditor: () => this.setState({detailViewMode: PanelMode.EDIT}),
        closeEditor: () => this.setState({detailViewMode: PanelMode.VIEW}),
        deleteTransaction: this.deleteTransaction.bind(this),
        associateTemplate: () => this.setState({detailViewMode: PanelMode.SET_TEMPLATE}),
        makeTemplate: this.makeTemplate.bind(this)
      };

      if (this.props.feed) {
        this.subscribeToFeed();
      }
    },
    componentWillReceiveProps(nextProps) {
      this.setState({transactions: nextProps.transactions});
    },
    componentDidUpdate(prevProps) {
      if (this.props.feed !== prevProps.feed) {
        this.subscribeToFeed();
      }
    },
    /**
     * Gets the maximum index for pagination.
     * The contract is that state#index < maxIndex.
     * @param {Object[]} transactions - transactions to paginate
     * @return {Number} max index
     */
    getMaxIndex(transactions) {
      return _.isEmpty(transactions) ? 1 : parseInt((transactions.length - 1) / this.props.pagination, 10) + 1;
    },
    subscribeToFeed() {
      const stream = this.props.feed.subscribe(
        transactions => {
          const rows = this.computeRows(transactions);

          const maxIdx = this.getMaxIndex(rows);
          if (maxIdx <= this.state.index) {
            this.setState({index: maxIdx - 1});
          }
        },
        err => console.error('[Failure] retrieving transactions', err)
      );
      this.setStream('transactions', stream);
    },
    computeRows(transactions) {
      if (!this.props.byGroup) {
        this.setState({transactions});
        return transactions;
      }

      const rows = [];
      const groups = {};
      for (const transaction of transactions) {
        if (transaction.group) {
          if (!Reflect.has(groups, transaction.group)) {
            const idx = rows.push({
              groupRow: true,
              groupId: transaction.group,
              count: 1
            }) - 1;
            groups[transaction.group] = {
              id: transaction.group,
              ref: idx // temporary information for processing time
            };
          } else {
            const idx = groups[transaction.group].ref;
            rows[idx].count += 1;
          }
        } else {
          rows.push(transaction);
        }
      }

      this.setState({transactions: rows, groups});

      if (!_.isEmpty(groups)) {
        const groupStream = this.groupsFeed
          .findAll(..._(groups).values()
            .map(group => ({id: group.id}))
            .value()
          ).watch()
          .subscribe(
            groups => this.setState({
              groups: _.keyBy(groups, 'id')
            }),
            err => console.error('Cannot retrieve groups', err)
          );
        this.setStream('groups', groupStream);
      }

      return rows;
    },
    highlightRow(tableIdx) {
      const rowIdx = this.state.index * this.props.pagination + tableIdx;
      const row = this.state.transactions[rowIdx];
      if (row.groupRow) {
        this.setState({
          detailledGroup: row.groupId
        });
      } else {
        this.setState({
          detailledTransaction: this.state.transactions[rowIdx].id,
          detailViewMode: PanelMode.VIEW
        });
      }
    },
    hideTransaction() {
      this.setState({detailledTransaction: null});
    },
    deleteTransaction() {
      const transaction = this.state.detailledTransaction;
      this.transactionsFeed.remove(transaction.id);
      this.hideTransaction();
    },
    makeTemplate() {
      const baseTransaction = _.find(this.state.transactions, {id: this.state.detailledTransaction});
      if (!baseTransaction) {
        throw new Error('No base transaction for template');
      }

      const template = {
        ...baseTransaction,
        frequency: {
          type: 'monthly'
        }
      };
      const transaction = {...baseTransaction};
      Reflect.deleteProperty(template, 'id');
      const addTemplate = this.getTemplateFeed().store(template)
        .subscribe(
          ({id}) => {
            transaction.templateId = id;
            const transactionUpdate = this.getTransactionFeed().update(transaction)
              .subscribe(
                () => console.log('Transaction stamped with tempplate'),
                err => console.error('Error when stamping transaction', err));

            this.setStream('transaction-update-with-template', transactionUpdate);
          },
          err => console.error('Failed to create template', err));
      this.setStream('template-creation', addTemplate);
    },
    hideGroup() {
      this.setState({detailledGroup: null});
    },
    renderTypeIcon(type) {
      switch (type) {
      case Type.CARTE: return <CreditCardIcon/>;
      case Type.CHEQUE: return <ChequeIcon />;
      case Type.MONNAIE: return <CoinIcon />;
      case Type.VIREMENT: return <TransferIcon />;
      default: return <span title={type}>??</span>;
      }
    },
    renderAmount(transaction) {
      const amount = transaction.amount || 0;
      const color = amount >= 0 ? '#a0fdbd' : '#fea4a9';

      return <Chip style={{margin: 4}} backgroundColor={color}>
        <span style={{fontSize: 13}}>{amount.toFixed(2)} €</span>
      </Chip>;
    },
    renderTransaction(transaction) {
      return <TableRow key={transaction.id} onClick={this.cbks.goPrevious}>
        <TableRowColumn style={TYPE_COLUMN_STYLE}>{this.renderTypeIcon(transaction.type)}</TableRowColumn>
        <TableRowColumn>{transaction.object}</TableRowColumn>
        <TableRowColumn>{this.renderAmount(transaction)}</TableRowColumn>
        <TableRowColumn>
          {new Date(transaction.date).toLocaleDateString()}
        </TableRowColumn>
      </TableRow>;
    },
    renderGroup({groupId, count}) {
      const group = this.state.groups[groupId];
      return <TableRow key={group.id}>
        <TableRowColumn style={TYPE_COLUMN_STYLE}>{count}+</TableRowColumn>
        <TableRowColumn>{group.name || group.id}</TableRowColumn>
        <TableRowColumn>...</TableRowColumn>
        <TableRowColumn>...</TableRowColumn>
      </TableRow>;
    },
    renderRows() {
      const startIdx = this.state.index * this.props.pagination;
      const endIdx = Math.min(startIdx + this.props.pagination, this.state.transactions.length);

      const rows = [];
      for (let i = startIdx; i < endIdx; i += 1) {
        const row = this.state.transactions[i];
        const rowElt = row.groupRow ?
          this.renderGroup(row) : this.renderTransaction(row);
        rows.push(rowElt);
      }

      return rows;
    },
    renderPrevious() {
      const enabled = this.state.index > 0;

      return <FloatingActionButton onTouchTap={this.cbks.goPrevious}
          mini={true} disabled={!enabled}>
        <ArrowUp/>
      </FloatingActionButton>;
    },
    renderNext() {
      const lastIndex = (this.state.index + 1) * this.props.pagination;
      const enabled = lastIndex < this.state.transactions.length;

      return <FloatingActionButton onTouchTap={this.cbks.goNext}
          mini={true} disabled={!enabled}>
        <ArrowDown/>
      </FloatingActionButton>;
    },
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
    },
    renderHighlightedTransaction() {
      if (this.state.detailledTransaction) {
        const title = <div className="dialog-header">
          <span className="dialog-title">Transaction</span>
          <div className="dialog-actions">
            <FlatButton label="Edit" onTouchTap={this.cbks.openEditor}/>
            <FlatButton label="Delete" onTouchTap={this.cbks.deleteTransaction}/>
            <FlatButton label="Set Template" onTouchTap={this.cbks.associateTemplate}/>
            <FlatButton label="As Template" onTouchTap={this.cbks.makeTemplate}/>
          </div>
        </div>;

        return <Dialog title={title}
            modal={false} open={true}
            onRequestClose={this.cbks.hideTransaction}
            autoScrollBodyContent={true}>
          <TransactionPanel transactionId={this.state.detailledTransaction}
            mode={this.state.detailViewMode}
            onSuccess={this.cbks.closeEditor} />
        </Dialog>;
      }
    },
    renderHighlightedGroup() {
      const {detailledGroup: groupId} = this.state;
      if (groupId) {
        const title = <div className="dialog-header">
          <span className="dialog-title">Group {groupId}</span>
        </div>;

        return <Dialog title={title}
            modal={false} open={true}
            onRequestClose={this.cbks.hideGroup}
            autoScrollBodyContent={true}>
          <GroupView groupId={groupId}/>
        </Dialog>;
      }
    },
    render() {
      if (_.isEmpty(this.state.transactions)) {
        return <p>No transactions</p>;
      }

      return <div>
        {this.renderHighlightedTransaction()}
        {this.renderHighlightedGroup()}
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <Table onCellClick={this.cbks.highlightRow} style={{flex: 1}}>
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
  });

export default TransactionsView;
