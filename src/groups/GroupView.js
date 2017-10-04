import React from 'react';
import PropTypes from 'prop-types';
import reactStamp from 'react-stamp';
import _ from 'lodash';

import TransactionsView from '../transactions/TransactionsView';
import {WithStreams} from '../core/rx';
import {WithHorizons} from '../core/horizon';

const GroupView = reactStamp(React)
  .compose(WithStreams, WithHorizons)
  .compose({
    props: {
      groupId: PropTypes.string
    },
    state: {
      group: null,
      transactions: []
    },
    componentDidMount() {
      this.loadGroup(this.props.groupId);
    },
    componentWillReceiveProps(nextProps) {
      if (this.props.groupId !== nextProps.groupId) {
        this.loadGroup(nextProps.groupId);
      }
    },
    loadGroup(groupId) {
      const groupStream = this.groupsFeed.find(groupId)
        .watch()
        .subscribe(
          group => this.setState({group}),
          err => console.error('Cannot load group', err)
        );
      this.setStream('group', groupStream);

      const transactionsStream = this.transactionsFeed
        .findAll({group: groupId})
        .order('date', 'ascending')
        .watch()
        .subscribe(
          transactions => this.setState({transactions}),
          err => console.error('Cannot load group', groupId, 'transactions', err)
        );
      this.setStream('transactions', transactionsStream);
    },
    renderGroup() {
      if (_.isEmpty(this.state.group)) {
        return <p>Loading {this.props.groupId} ...</p>;
      } else {
        const total = !_.isEmpty(this.state.transactions) ?
          _.sumBy(this.state.transactions, 'amount').toFixed(2) : ' -- ';
        return <p>
          Group: {this.state.group.name}<br/>
          Total du groupe : <b>{total}€</b>
        </p>;
      }
    },
    renderTransactions() {
      if (_.isEmpty(this.state.transactions)) {
        return <p>No transactions</p>;
      } else {
        return <TransactionsView transactions={this.state.transactions} byGroup={false} />;
      }
    },
    render() {
      return <div>
        {this.renderGroup()}
        {this.renderTransactions()}
      </div>;
    }
  });

export default GroupView;