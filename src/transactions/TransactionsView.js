import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {connect} from 'react-redux';
import {Button, Icon, Modal, Table, Tag} from 'antd';

import {Type} from './models';
import TransactionPanel, {Mode as PanelMode} from './TransactionPanel';
import GroupView from '../groups/GroupView';
import actions from '../redux/actions';
import {getStateValues} from '../redux/horizonStore';

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

  highlightRow(row, rowIdx) {
    // const rowIdx = this.state.index * this.props.pagination + tableIdx;
    const transaction = this.state.transactions[rowIdx];
    if (transaction.groupRow) {
      this.setState({
        detailledGroup: transaction.groupId
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
    case Type.CARTE: return <Icon type="credit-card"/>;
    case Type.CHEQUE: return <Icon type="idcard"/>;
    case Type.MONNAIE: return <Icon type="euro"/>;
    case Type.VIREMENT: return <Icon type="swap"/>;
    default: return <span title={type}>--</span>;
    }
  }

  renderAmount(amount) {
    if (_.isNumber(amount)) {
      const color = amount >= 0 ? '#a0fdbd' : '#fea4a9';

      return (
        <Tag style={{margin: 4}} color={color}>
          {amount.toFixed(2)} €
        </Tag>
      );
    } else {
      return amount;
    }
  }

  renderTransaction(transaction) {
    return {
      type: transaction.type,
      object: transaction.object,
      value: transaction.amount,
      date: new Date(transaction.date).toLocaleDateString()
    };
  }

  renderGroup({groupId, count}) {
    const group = {
      ...this.state.groups[groupId],
      ...this.props.groups[groupId]
    };
    return {
      type: `${count}+`,
      object: group.name || group.id,
      value: '...',
      date: '...'
    };
  }

  renderTable() {
    const columns = [{
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: type => this.renderTypeIcon(type)
    }, {
      title: 'Objet',
      dataIndex: 'object',
      key: 'object',
    }, {
      title: 'Montant',
      dataIndex: 'value',
      key: 'value',
      render: value => this.renderAmount(value)
    }, {
      title: 'Date',
      dataIndex: 'date',
      key: 'date'
    }];

    const dataSource = this.state.transactions.map(
      row => row.groupRow ? this.renderGroup(row) : this.renderTransaction(row));

    return <Table  
        size="small"
        dataSource={dataSource} columns={columns} 
        onRow={(record, index) => ({
          onClick: () => this.highlightRow(record, index)
        })} />
  }

  renderHighlightedTransaction() {
    if (this.state.detailledTransaction) {
      const title = 'Transaction';
      const footer = [];
          
      if (this.state.detailViewMode !== PanelMode.VIEW) {
        footer.push(<Button onClick={this.cbks.closeEditor}>Voir</Button>);
      }
      if (this.state.detailViewMode !== PanelMode.EDIT) {
        footer.push(<Button onClick={this.cbks.openEditor}>Éditer</Button>);
      }
      footer.push(<Button onClick={this.cbks.deleteTransaction}>Supprimer</Button>);
      if (this.state.detailViewMode !== PanelMode.SET_TEMPLATE) {
        footer.push(<Button onClick={this.cbks.associateTemplate}>Set Template</Button>);
      }
      footer.push(<Button onClick={this.cbks.makeTemplate}>As Template</Button>);

      return <Modal 
          title={title}
          visible={true}
          onOk={this.cbks.hideTransaction}
          onCancel={this.cbks.hideTransaction}
          footer={footer}>
        <TransactionPanel transactionId={this.state.detailledTransaction}
          mode={this.state.detailViewMode}
          onSuccess={this.cbks.closeEditor} />
      </Modal>;
    }
  }

  renderHighlightedGroup() {
    const {detailledGroup: groupId} = this.state;
    if (groupId) {
      const title = <div className="dialog-header">
        <span className="dialog-title">Group {groupId}</span>
      </div>;

      return <Modal 
          title={title}
          visible={true}
          onOk={this.cbks.hideGroup}
          onCancel={this.cbks.hideGroup}>
        <GroupView groupId={groupId}/>
      </Modal>;
    }
  }

  render() {
    if (_.isEmpty(this.state.transactions)) {
      return <p>No transactions</p>;
    }
    return <div>
      {this.renderHighlightedTransaction()}
      {this.renderHighlightedGroup()}
      {this.renderTable()}
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
