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
import GroupPicker from '../groups/GroupPicker';
import GroupEditor from '../groups/GroupEditor';
import {WithHorizons} from '../core/horizon';
import {StateForm} from '../core/muiForm';
import ElementEditor, {HorizonEditor} from '../core/ElementEditor';

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
  .compose(WithHorizons, ElementEditor, HorizonEditor, StateForm)
  .compose({
    propTypes: {
      transaction: React.PropTypes.object
    },
    defaultProps: {
      transaction: {}
    },
    state: {
      categories: [],
      accounts: [],
      openCategoryForm: false,
      openGroupForm: false,
      askTransferAccount: false
    },
    init(props, {instance}) {
      const key = 'transaction';
      instance.elementKey = key;
      instance.formStateKey = key;

      const transaction = _.assign({}, DEFAULT_TRANSACTION, instance.props.transaction);
      transaction.date = transaction.date !== undefined ?
        new Date(transaction.date) : new Date();

      instance.state.transaction = transaction;
    },
    componentWillMount() {
      this.cbks = Object.assign({}, this.cbks, {
        setObject: this.setModelFromInput.bind(this, 'object'),
        setAmount: this.setModelFromInput.bind(this, 'amount'),
        setAccount: this.setModelValue.bind(this, 'account'),
        setType: this.setModelFromChoice.bind(this, 'type'),
        setCategory: this.setModelValue.bind(this, 'category'),
        setGroup: this.setModelValue.bind(this, 'group'),
        setDate: this.setModelFromInput.bind(this, 'date'),
        addCategory: this.toggleCategoryForm.bind(this, true),
        closeCategoryForm: this.toggleCategoryForm.bind(this, false),
        addGroup: this.toggleGroupForm.bind(this, true),
        closeGroupForm: this.toggleGroupForm.bind(this, false),
        startTransfer: this.transfer.bind(this),
        completeTransfer: this.transfer.bind(this, true),
        cancelTransfer: this.transfer.bind(this, false)
      });
    },
    getElementFeed() {
      return this.transactionsFeed;
    },
    getValue(key) {
      return this.state.transaction[key]
        || this.props.transaction[key];
    },
    formatEditedElement(transaction) {
      if (transaction.date !== undefined) {
        transaction.date = transaction.date.getTime();
      }
      if (transaction.amount !== undefined) {
        transaction.amount = parseFloat(transaction.amount);
      }
    },
    reset() { // Override from HorizonEditor
      const transaction = this.state.transaction;
      // Remove changing props
      ['object', 'amount', 'group'].forEach(prop => { transaction[prop] = '';});
      // Reset to default props
      const newValue = _.assign({}, transaction, DEFAULT_TRANSACTION);
      this.setState({transaction: newValue});
    },
    canSubmit() {
      const transaction = this.getEditedElement();
      return !_.isEmpty(transaction.object)
        && transaction.amount
        && transaction.date
        && transaction.account
        && transaction.type
        && transaction.category;
    },
    transfer(execute, toAccount) {
      if (execute === true) {
        const transaction = this.getEditedElement();
        if (transaction.account !== toAccount) {
          const oppositeTransaction = Object.assign(
            {}, transaction, {amount: -transaction.amount, account: toAccount}
          );
          Promise.all([
            this.save(transaction, 'transferFrom'),
            this.save(oppositeTransaction, 'transferTo')
          ]).then(([original]) => this.onElementSaved(original))
            // Do not call the submit callback as it is a special case
            .catch(err => this.onFailedSubmit(err, transaction))
            .then(() => this.setState({askTransferAccount: false}));
        } else {
          console.error('Cannot transfer to the same account', toAccount);
          this.setState({askTransferAccount: false});
        }
      } else if (execute === false) {
        this.setState({askTransferAccount: false});
      } else {
        // Ask the destination account
        this.setState({askTransferAccount: true});
      }
    },
    toggleCategoryForm(open) {
      this.setState({openCategoryForm: open});
    },
    toggleGroupForm(open) {
      this.setState({openGroupForm: open});
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
    renderGroups() {
      return <GroupPicker
        value={this.getValue('group')}
        onSelect={this.cbks.setGroup} />;
    },
    renderForms() {
      return [
        <Dialog key="category"
          title="Ajouter une catégorie"
          modal={false} open={this.state.openCategoryForm}
          onRequestClose={this.cbks.closeCategoryForm}>
          <CategoryEditor onSubmit={_.noop} />
        </Dialog>,
        <Dialog key="group"
          title="Ajouter un group"
          modal={false} open={this.state.openGroupForm}
          onRequestClose={this.cbks.closeGroupForm}>
          <GroupEditor onSubmit={_.noop} />
        </Dialog>,
        <Dialog key="transfer"
          title="Choisir le compte pour le transfert"
          modal={false} open={this.state.askTransferAccount}
          onRequestClose={this.cbks.cancelTransfer}>
          <AccountPicker onSelect={this.cbks.completeTransfer} />
        </Dialog>
      ];
    },
    renderSubmitButtons() {
      const btns = [
        <RaisedButton key="save-btn" label="Sauver" primary={true}
          disabled={!this.canSubmit()}
          onClick={this.cbks.submit} />
      ];

      if (!this.getValue('id')) {
        btns.push(<RaisedButton key="transfer-btn" label="Transférer"
          disabled={!this.canSubmit()}
          onClick={this.cbks.startTransfer}/>
        );
      }

      return btns;
    },
    render() {
      return <div>
        {this.renderForms()}
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
        <div>
          {this.renderGroups()}
          <FloatingActionButton onTouchTap={this.cbks.addGroup} mini={true}>
            <ContentAdd />
          </FloatingActionButton>
        </div>
        {this.renderSubmitButtons()}
      </div>;
    }
  });

export default TransactionEditor;
