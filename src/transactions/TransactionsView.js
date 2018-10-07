import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {connect} from 'react-redux';

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
import actions from '../redux/actions';
import {getStateValues} from '../redux/horizonStore';

const TYPE_COLUMN_STYLE = {
  width: 40,
  textAlign: 'center'
};

class TransactionsView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      transactions: props.transactions,
      detailledTransaction: null,
      index: 0
    };
  }

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

    const rows = this.computeRows(this.props.transactions);
    const maxIdx = this.getMaxIndex(rows);
    if (maxIdx <= this.state.index) {
      this.setState({index: maxIdx - 1});
    }
  }

  componentDidMount() {
    if (!_.isEmpty(this.state.groups)) {
      this.props.loadGroups(_.keys(this.state.groups));
    }
  }

  componentWillReceiveProps(nextProps) {
    const rows = this.computeRows(nextProps.transactions);
    const maxIdx = this.getMaxIndex(rows);
    if (maxIdx <= this.state.index) {
      this.setState({index: maxIdx - 1});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const newGroupIds = _.difference(
      _.keys(this.state.groups),
      _.keys(prevState.groups));
    if (!_.isEmpty(newGroupIds)) {
      this.props.loadGroups(newGroupIds);
    }
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
            ref: idx // idx of the row with group info
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

    return rows;
  }

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
  }

  hideTransaction() {
    this.setState({detailledTransaction: null});
  }

  deleteTransaction() {
    if (this.state.detailledTransaction) {
      this.props.deleteTransaction(this.state.detailledTransaction);
      this.hideTransaction();
    }
  }

  makeTemplate() {
    const baseTransaction = _.find(this.state.transactions, {id: this.state.detailledTransaction});
    if (!baseTransaction) {
      throw new Error('No base transaction for template');
    }

    // Remove the id of the base transaction
    Reflect.deleteProperty(baseTransaction, 'id');

    this.props.makeTemplate(baseTransaction);
  }

  hideGroup() {
    this.setState({detailledGroup: null});
  }

  renderTypeIcon(type) {
    switch (type) {
    case Type.CARTE: return <CreditCardIcon/>;
    case Type.CHEQUE: return <ChequeIcon />;
    case Type.MONNAIE: return <CoinIcon />;
    case Type.VIREMENT: return <TransferIcon />;
    default: return <span title={type}>??</span>;
    }
  }

  renderAmount(transaction) {
    const amount = transaction.amount || 0;
    const color = amount >= 0 ? '#a0fdbd' : '#fea4a9';

    return <Chip style={{margin: 4}} backgroundColor={color}>
      <span style={{fontSize: 13}}>{amount.toFixed(2)} €</span>
    </Chip>;
  }

  renderTransaction(transaction) {
    return <TableRow key={transaction.id} onClick={this.cbks.goPrevious}>
      <TableRowColumn style={TYPE_COLUMN_STYLE}>{this.renderTypeIcon(transaction.type)}</TableRowColumn>
      <TableRowColumn>{transaction.object}</TableRowColumn>
      <TableRowColumn>{this.renderAmount(transaction)}</TableRowColumn>
      <TableRowColumn>
        {new Date(transaction.date).toLocaleDateString()}
      </TableRowColumn>
    </TableRow>;
  }

  renderGroup({groupId, count}) {
    const group = {
      ...this.state.groups[groupId],
      ...this.props.groups[groupId]
    };
    return <TableRow key={group.id}>
      <TableRowColumn style={TYPE_COLUMN_STYLE}>{count}+</TableRowColumn>
      <TableRowColumn>{group.name || group.id}</TableRowColumn>
      <TableRowColumn>...</TableRowColumn>
      <TableRowColumn>...</TableRowColumn>
    </TableRow>;
  }

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
  }

  renderPrevious() {
    const enabled = this.state.index > 0;

    return <FloatingActionButton
        onTouchTap={enabled ? this.cbks.goPrevious : _.noop}
        mini={true}
        disabled={!enabled}>
      <ArrowUp/>
    </FloatingActionButton>;
  }

  renderNext() {
    const lastIndex = (this.state.index + 1) * this.props.pagination;
    const enabled = lastIndex < this.state.transactions.length;

    return <FloatingActionButton
        onTouchTap={enabled ? this.cbks.goNext : _.noop}
        mini={true}
        disabled={!enabled}>
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

  renderHighlightedTransaction() {
    if (this.state.detailledTransaction) {
      const title = <div className="dialog-header">
        <span className="dialog-title">Transaction</span>
        <div className="dialog-actions">
          {
            this.state.detailViewMode !== PanelMode.VIEW
              ? <FlatButton label="View" onTouchTap={this.cbks.closeEditor}/>
              : null
          }
          {
            this.state.detailViewMode !== PanelMode.EDIT
              ? <FlatButton label="Edit" onTouchTap={this.cbks.openEditor}/>
              : null
          }
          <FlatButton label="Delete" onTouchTap={this.cbks.deleteTransaction}/>
          {
            this.state.detailViewMode !== PanelMode.SET_TEMPLATE
              ? <FlatButton label="Set Template" onTouchTap={this.cbks.associateTemplate}/>
              : null
          }
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
  }

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
  }

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
}

TransactionsView.propTypes = {
  viewId: PropTypes.string.isRequired,
  transactions: PropTypes.array.isRequired,
  pagination: PropTypes.number,
  byGroup: PropTypes.bool
};

TransactionsView.defaultProps = {
  transactions: [],
  pagination: 20,
  byGroup: true
};

const groupQueryId = (props) => `TransactionsView-${props.viewId}-groups`;

function stateToProps(state, props) {
  const groups = _.keyBy(
      getStateValues(state.groups, groupQueryId(props)),
      'id');

  return {
    groups
  };
}

function dispatchToProps(dispatch, props) {
  return {
    loadGroups: (groupIds) => dispatch({
      type: actions.groups.query,
      queryId: groupQueryId(props),
      conditions: groupIds.map(id => ({id}))
    }),
    deleteTransaction: (transactionId) => dispatch({
      type: actions.transactions.delete,
      value: transactionId
    }),
    makeTemplate: (transaction) => dispatch({
      type: actions.transactions.toTemplate,
      transaction
    })
  };
}

export default connect(stateToProps, dispatchToProps)(TransactionsView);
export {
  TransactionsView
};
