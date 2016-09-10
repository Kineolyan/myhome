import React from 'react';

function asDate(value) {
  if (value) {
    return new Date(value).toLocaleDateString();
  } else {
    return '--';
  }
}

class TransactionView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      account: {},
      category: {}
    };
  }

  get transaction() {
    return this.props.transaction;
  }

  get accountFeed() {
    return this.context.horizons.accounts;
  }

  get categoryFeed() {
    return this.context.horizons.categories;
  }

  componentWillMount() {
    this.accountFeed.find(this.transaction.account)
      .fetch().defaultIfEmpty()
      .subscribe(
        account => this.setState({account: account || {}}),
        err => console.error('[Failure] retrieving account', err)
      );
    this.categoryFeed.find(this.transaction.category)
      .fetch().defaultIfEmpty()
      .subscribe(
        category => this.setState({category: category || {}}),
        err => console.error('[Failure] retrieving category', err)
      );
  }

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
      <p style={{fontStyle: 'italic', fontSize: '0.8em'}}>
        Créée le {asDate(this.transaction.createdAt)}, mise à jour le {asDate(this.transaction.updatedAt)}
      </p>
    </div>;
  }
}

TransactionView.propTypes = {
  transaction: React.PropTypes.object.isRequired
};

TransactionView.contextTypes = {
  horizons: React.PropTypes.object
};

export default TransactionView;
