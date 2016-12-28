import React from 'react';
import reactStamp from 'react-stamp';

import {asDate} from '../core/time';
import {WithStreams} from '../core/rx';
import {WithHorizons} from '../core/horizon';

const TransactionView = reactStamp(React)
  .compose(WithStreams, WithHorizons)
  .compose({
    propTypes: {
      transaction: React.PropTypes.object.isRequired
    },
    state: {
      account: {},
      category: {},
      group: {}
    },
    init(props, {instance}) {
      Reflect.defineProperty(instance, 'transaction', {
        get: () => instance.props.transaction
      });
    },
    componentWillMount() {
      const accountStream = this.accountsFeed.find(this.transaction.account)
        .fetch().defaultIfEmpty()
        .subscribe(
          account => this.setState({account: account || {}}),
          err => console.error('[Failure] retrieving account', err)
        );
      this.setStream('account', accountStream);

      const categoryStream = this.categoriesFeed.find(this.transaction.category)
        .fetch().defaultIfEmpty()
        .subscribe(
          category => this.setState({category: category || {}}),
          err => console.error('[Failure] retrieving category', err)
        );
      this.setStream('category', categoryStream);

      if (this.transaction.group) {
        const groupStream = this.groupsFeed.find(this.transaction.group)
          .fetch().defaultIfEmpty()
          .subscribe(
            group => this.setState({group: group || {}}),
            err => console.error('[Failure] retrieving group', err)
          );
        this.setStream('group', groupStream);
      }
    },
    renderGroup() {
      if (this.transaction.group) {
        return <p>
          Groupe: {this.state.group.name || this.transaction.group}
        </p>;
      }
    },
    render() {
      return <div>
        <p>{this.transaction.object} le {asDate(this.transaction.date)}<br/>
        Montant de {this.transaction.amount} €
        </p>
        <p>
          Compte : {this.state.account.name || this.transaction.account}
        </p>
        <p>
          Catégorie : {this.state.category.name || this.transaction.category}
        </p>
        <p>
          Type de payement : {this.transaction.type}
        </p>
        {this.renderGroup()}
        <p style={{fontStyle: 'italic', fontSize: '0.8em'}}>
          Créée le {asDate(this.transaction.createdAt)}, mise à jour le {asDate(this.transaction.updatedAt)}
        </p>
      </div>;
    }
  });

export default TransactionView;
