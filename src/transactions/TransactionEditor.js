import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import reactStamp from 'react-stamp';
import {connect} from 'react-redux';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import actions from '../redux/actions';
import {getEditedValue} from '../redux/editorStore';
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
  object: '',
  type: Type.CARTE
};

const TransactionEditor = reactStamp(React)
  .compose(WithHorizons, ElementEditor, HorizonEditor, StateForm)
  .compose({
    propTypes: {
      transaction: PropTypes.object
    },
    defaultProps: {
      transaction: {}
    },
    state: {
      categories: [],
      accounts: [],
      latestObjects: [],
      templates: [],
      openCategoryForm: false,
      openGroupForm: false,
      askTransferAccount: false
    },
    init(props, {instance}) {
      const key = 'transaction';
      instance.elementKey = key;
      instance.formStateKey = key;
      instance.setModelValue = function(key, value, acceptEmpty = false) {
        const element = {...this.props.editedTransaction};
        if (!_.isEmpty(value) || acceptEmpty || value instanceof Date) {
          element[key] = value;
        } else {
          Reflect.deleteProperty(element, key);
        }
  
        this.props.edit(element);
      };
      instance.readEditedElement = function() {
        return this.props.editedTransaction;
      };

      instance.state.transaction = this.makeStateTransaction(instance.props.transaction);
    },
    componentWillMount() {
      if (this.props.transaction) {
        const t = {
          ...this.props.transaction,
          date: new Date(this.props.transaction.date)
        };
        this.props.setUp(t);
      }

      this.cbks = Object.assign({}, this.cbks, {
        setObject: value => this.setModelValue('object', value || '', true),
        selectCompletedObject: this.defineTransactionObject.bind(this),
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

      const lastestTransactions = this.transactionsFeed
        .order('updatedAt', 'descending')
        .limit(100)
        .watch()
        .subscribe(
          transactions => {
            const objects = _(transactions)
              .map(t => t.object)
              .uniq()
              .value();
            this.setState({latestObjects: objects});
          },
          err => {
            console.error('Cannot retrieve latest transactions', err);
            this.setState({existingObjects: []});
          });
      this.setStream('latestTransactions', lastestTransactions);

      const templates = this.getTemplateFeed()
          .watch()
          .subscribe(
              templates => this.setState({templates}),
              err => console.error('Faied to retrieve templates', err));
      this.setStream('transactionTemplates', templates);
    },
    makeStateTransaction(template) {
      const transaction = _.assign({}, DEFAULT_TRANSACTION, template);
      transaction.date = transaction.date !== undefined ?
        new Date(transaction.date) : new Date();
      return transaction;
    },
    getElementFeed() {
      return this.transactionsFeed;
    },
    getValue(key) {
      return this.props.editedTransaction[key]
        || this.props.transaction[key];
    },
    defineTransactionObject(chosenObject, idx) {
      const template = this.state.templates[idx - this.state.latestObjects.length];
      if (template !== undefined && chosenObject === `${template.object} [t]`) {
        // Save the transaction id for update
        const transactionId = this.props.editedTransaction.id;
        const transaction = this.makeStateTransaction(template);
        transaction.id = transactionId;
        transaction.templateId = template.id;
        // Set the current month and year for the date
        const now = new Date();
        transaction.date.setFullYear(now.getFullYear());
        transaction.date.setMonth(now.getMonth());
        if (now < transaction.date) {
          // Set a template for end of month at a beginnning of a month
          transaction.date.setMonth(transaction.date.getMonth() - 1);
        }

        this.setState({transaction});
      } else {
        // Just use the value without template
        this.setModelValue('object', chosenObject);
      }
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
      const transaction = {
        ...DEFAULT_TRANSACTION,
        ...this.props.editedTransaction
      };
      // Remove changing props
      ['object', 'amount', 'group'].forEach(prop => { transaction[prop] = '';});
      this.props.edit(transaction);
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
    renderObject() {
      const suggestions = [
        ...this.state.latestObjects,
        ...this.state.templates.map(t => `${t.object} [t]`)
      ];

      return <div>
        <AutoComplete
          hintText="Objet de la transaction"
          filter={AutoComplete.fuzzyFilter}
          searchText={this.props.editedTransaction.object}
          dataSource={suggestions}
          onUpdateInput={this.cbks.setObject}
          onNewRequest={this.cbks.selectCompletedObject}
          maxSearchResults={10}
        />
      </div>;
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
        {this.renderObject()}
        <div>
          <TextField hintText="Montant de la transaction" type="number"
            value={this.props.editedTransaction.amount}
            onChange={this.cbks.setAmount} />
        </div>
        <div>
          <DatePicker
            hintText="Date de la transaction"
            value={this.props.editedTransaction.date}
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

function mapStateToProps(state, props) {
  const editedTransaction = getEditedValue(
    state.editors, 
    props.editorId, 
    DEFAULT_TRANSACTION);
  return {
    ...props,
    editedTransaction
  };
}

function mapDispatchToProps(dispatch, props) {
  return {
    setUp: transaction => dispatch({
      type: actions.editors.setup,
      editorId: props.editorId,
      value: transaction
    }),
    edit: transaction => dispatch({
      type: actions.editors.edit,
      editorId: props.editorId,
      value: transaction
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionEditor);
export {
  TransactionEditor
};
