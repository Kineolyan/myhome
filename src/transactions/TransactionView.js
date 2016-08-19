import React from 'react';

class TransactionView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      account: {}
    };
  }

  get transaction() {
    return this.props.transaction;
  }

  get accountFeed() {
    return this.context.horizons.accounts;
  }

  componentWillMount() {
    this.accountFeed.find(this.transaction.account)
      .fetch().defaultIfEmpty()
      .subscribe(
        account => {
          console.log('account loaded:', account);
          this.setState({account: account || {}});
        },
        err => console.error('[Failure] retrieving account', err)
      );
  }

  render() {
    return <div>
      <p>{this.transaction.object} le {new Date(this.transaction.date).toLocaleDateString()}<br/>
      Montant de {this.transaction.amount} €
      </p>
      <p>
        Compte: {this.state.account.name || this.transaction.account}
      </p>
      <p>
        Catégorie: {this.transaction.category}
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
