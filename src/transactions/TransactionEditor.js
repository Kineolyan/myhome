import React from 'react';
import _ from 'lodash';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';

const Type = {
  CARTE: 'carte',
  MONNAIE: 'monnaie',
  CHEQUE: 'cheque',
  VIREMENT: 'virement'
};

const PAYMENT_TYPES = [
  {id: Type.CARTE, name: 'Carte'},
  {id: Type.MONNAIE, name: 'Monnaie'},
  {id: Type.CHEQUE, name: 'Chèque'},
  {id: Type.VIREMENT, name: 'Virement'}
];

const TODAY = new Date();

function setFirstIfUndefined(obj, key, values) {
  if (obj[key] === undefined) {
    obj[key] = values[0].id;
  }
}

class TransactionEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      categories: [],
      accounts: [],
      transaction: {}
    };
  }

  componentWillMount() {
    this.cbks = {
      setObject: this.setInput.bind(this, 'object'),
      setAmount: this.setInput.bind(this, 'amount'),
      setAccount: this.setChoice.bind(this, 'account'),
      setType: this.setChoice.bind(this, 'type'),
      setCategory: this.setChoice.bind(this, 'category'),
      setDate: this.setInput.bind(this, 'date'),
      submit: this.submit.bind(this)
    };

    this.categoryFeed
      .order('name', 'ascending')
      .watch().subscribe(
        categories => {
          // weirdly, not sorted
          this.setState({categories: _.sortBy(categories, ['name'])})
        },
        err => console.log('[Failure] fetch categories', err)
      );
    this.accountFeed
      .order('name', 'ascending')
      .watch().subscribe(
        accounts => this.setState({accounts}),
        err => console.log('[Failure] fetch accounts', err)
      );
  }

  get feed() {
    return this.context.horizons.transactions;
  }

  get categoryFeed() {
    return this.context.horizons.categories;
  }

  get accountFeed() {
    return this.context.horizons.accounts;
  }

  setInput(key, event, value) {
    return this.setValue(key, value);
  }

  setChoice(key, event, index, value) {
    return this.setValue(key, value);
  }

  setValue(key, value) {
    const transaction = this.state.transaction;
    if (!_.isEmpty(value) || value instanceof Date) {
      transaction[key] = value;
    } else {
      Reflect.deleteProperty(transaction, key);
    }

    this.setState({transaction: transaction});
  }

  getEditedTransaction() {
    const transaction = _.clone(this.state.transaction); // Shallow clone is enough

    setFirstIfUndefined(transaction, 'account', this.state.accounts);
    setFirstIfUndefined(transaction, 'type', PAYMENT_TYPES);
    setFirstIfUndefined(transaction, 'category', this.state.categories);

    if (transaction.date !== undefined) {
      transaction.date = transaction.date.getTime();
    }
    if (transaction.amount !== undefined) {
      transaction.amount = parseFloat(transaction.amount);
    }

    return transaction;
  }

  saveTransaction(transaction) {
    if (transaction.id === undefined) {
      return new Promise((resolve, reject) => {
        this.feed.store(transaction).subscribe(
          resolve,
          reject
        );
      });
    } else {
      return Promise.reject(new Error('Unsupported update'));
    }
  }

  resetTransaction() {
    this.setState({transaction: {}});
  }

  submit() {
    const transaction = this.getEditedTransaction();
    this.saveTransaction(transaction)
      .then(() => this.resetTransaction());
  }

  renderChoices(values, valueFn, cbk, hintText) {
    return <SelectField
        value={valueFn(this.state) || valueFn(this.props) || null}
        onChange={cbk}
        floatingLabelText={hintText}
        floatingLabelFixed={true}>
      {values.map(value => <MenuItem key={value.id}
          value={value.id} primaryText={value.name} />)}
    </SelectField>;
  }

  renderAccount() {
    return this.renderChoices(
      this.state.accounts,
      store => store.transaction.account,
      this.cbks.setAccount,
      'Compte'
    );
  }

  renderType() {
    return this.renderChoices(
      PAYMENT_TYPES,
      store => store.transaction.type,
      this.cbks.setType,
      'Moyen de payement'
    );
  }

  renderCategories() {
    return this.renderChoices(
      this.state.categories,
      store => store.transaction.category,
      this.cbks.setCategory,
      'Catégorie de la transaction'
    );
  }

  render() {
    return <div>
      <div>
        <TextField hintText="Objet de la transaction"
          defaultValue={this.props.transaction.object}
          value={this.state.transaction.object}
          onChange={this.cbks.setObject} />
      </div>
      <div>
        <TextField hintText="Montant de la transaction" type="number"
          defaultValue={this.props.transaction.amount}
          value={this.state.transaction.amount}
          onChange={this.cbks.setAmount} />
      </div>
      <div>
        <DatePicker
          hintText="Date de la transaction"
          value={this.state.transaction.date}
          maxDate={TODAY}
          onChange={this.cbks.setDate} autoOk={true}/>
      </div>
      <div>
        {this.renderAccount()}
      </div>
      <div>
        {this.renderType()}
      </div>
      <div>
        {this.renderCategories()}
      </div>
      <RaisedButton label="Sauver" primary={true}
        onClick={this.cbks.submit} />
    </div>;
  }
}

TransactionEditor.propTypes = {
  transaction: React.PropTypes.object
};

TransactionEditor.defaultProps = {
  transaction: {}
};

TransactionEditor.contextTypes = {
  horizons: React.PropTypes.object
};

export default TransactionEditor;
