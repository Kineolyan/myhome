import React from 'react';
import _ from 'lodash';
import reactStamp from 'react-stamp';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';
import Dialog from 'material-ui/Dialog';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import {Type} from './models';
import CategoryPicker from '../categories/CategoryPicker';
import CategoryEditor from '../categories/CategoryEditor';
import AccountPicker from '../comptes/AccountPicker';
import {auditItem} from '../core/auditActions';
import {WithHorizons, HorizonsShape} from '../core/horizon';

const PAYMENT_TYPES = [
  {id: Type.CARTE, name: 'Carte'},
  {id: Type.MONNAIE, name: 'Monnaie'},
  {id: Type.CHEQUE, name: 'Chèque'},
  {id: Type.VIREMENT, name: 'Virement'}
];

const TODAY = new Date();
const DEFAULT_TRANSACTION = {
  type: Type.CARTE
};

const TransactionEditor = reactStamp(React)
  .compose(WithHorizons)
  .compose({
    propTypes: {
      transaction: React.PropTypes.object,
      onSubmit: React.PropTypes.func
    },
    defaultProps: {
      transaction: {},
      onSubmit: _.noop
    },
    state: {
      categories: [],
      accounts: [],
      openCategoryForm: false
    },
    init(props, {instance}) {
      const transaction = _.assign({}, DEFAULT_TRANSACTION, instance.props.transaction);
      transaction.date = transaction.date !== undefined ?
        new Date(transaction.date) : new Date();

      instance.state.transaction = transaction;

      Reflect.defineProperty(instance, 'feed', {
        get: function() {
          return this.transactionFeed;
        }
      });
    },
    componentWillMount() {
      this.cbks = {
        setObject: this.setInput.bind(this, 'object'),
        setAmount: this.setInput.bind(this, 'amount'),
        setAccount: this.setValue.bind(this, 'account'),
        setType: this.setChoice.bind(this, 'type'),
        setCategory: this.setValue.bind(this, 'category'),
        setDate: this.setInput.bind(this, 'date'),
        submit: this.submit.bind(this),
        addCategory: this.toggleCategoryForm.bind(this, true),
        closeCategoryForm: this.toggleCategoryForm.bind(this, false)
      };
    },
    setInput(key, event, value) {
      return this.setValue(key, value);
    },
    setChoice(key, event, index, value) {
      return this.setValue(key, value);
    },
    getValue(key) {
      return this.state.transaction[key]
        || this.props.transaction[key];
    },
    setValue(key, value) {
      const transaction = this.state.transaction;
      if (!_.isEmpty(value) || value instanceof Date) {
        transaction[key] = value;
      } else {
        Reflect.deleteProperty(transaction, key);
      }

      this.setState({transaction: transaction});
    },
    getEditedTransaction() {
      const transaction = _.clone(this.state.transaction); // Shallow clone is enough
      if (this.props.transaction.id !== undefined) {
        transaction.id = this.props.transaction.id;
      }

      if (transaction.date !== undefined) {
        transaction.date = transaction.date.getTime();
      }
      if (transaction.amount !== undefined) {
        transaction.amount = parseFloat(transaction.amount);
      }

      return auditItem(transaction);
    },
    saveTransaction(transaction) {
      return new Promise((resolve, reject) => {
        const action = transaction.id === undefined ?
          this.feed.store(transaction) : this.feed.update(transaction);
          action.subscribe(resolve, reject);
      });
    },
    resetTransaction() {
      const transaction = this.state.transaction;
      // Remove changing props
      ['object', 'amount'].forEach(prop => { transaction[prop] = '';});
      // Reset to default props
      _.assign(transaction, DEFAULT_TRANSACTION);
      this.setState({transaction});
    },
    canSubmit() {
      const transaction = this.getEditedTransaction();
      return !_.isEmpty(transaction.object)
        && transaction.amount
        && transaction.date
        && transaction.account
        && transaction.type
        && transaction.category;
    },
    submit() {
      const transaction = this.getEditedTransaction();
      this.saveTransaction(transaction)
        .then(() => {
          this.resetTransaction();
          this.props.onSubmit();
        });
    },
    toggleCategoryForm(open) {
      this.setState({openCategoryForm: open});
    },
    renderChoices(values, valueFn, cbk, hintText) {
      return <SelectField
          value={valueFn(this.state) || valueFn(this.props) || null}
          onChange={cbk}
          floatingLabelText={hintText}
          floatingLabelFixed={true}>
        {values.map(value => <MenuItem key={value.id}
            value={value.id} primaryText={value.name} />)}
      </SelectField>;
    },
    renderAccount() {
      return <AccountPicker
        value={this.getValue('account')}
        onSelect={this.cbks.setAccount} />;
    },
    renderType() {
      return this.renderChoices(
        PAYMENT_TYPES,
        store => store.transaction.type,
        this.cbks.setType,
        'Moyen de payement'
      );
    },
    renderCategories() {
      return <CategoryPicker
        value={this.getValue('category')}
        onSelect={this.cbks.setCategory} />;
    },
    render() {
      return <div>
        <Dialog title="Ajouter une catégorie"
          modal={false} open={this.state.openCategoryForm}
          onRequestClose={this.cbks.closeCategoryForm}>
          <CategoryEditor onSubmit={_.noop} />
        </Dialog>
        <div>
          <TextField hintText="Objet de la transaction"
            value={this.state.transaction.object}
            onChange={this.cbks.setObject} />
        </div>
        <div>
          <TextField hintText="Montant de la transaction" type="number"
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
          <FloatingActionButton onTouchTap={this.cbks.addCategory} mini={true}>
            <ContentAdd />
          </FloatingActionButton>
        </div>
        <RaisedButton label="Sauver" primary={true}
          disabled={!this.canSubmit()}
          onClick={this.cbks.submit} />
      </div>;
    }
  });

export default TransactionEditor;
