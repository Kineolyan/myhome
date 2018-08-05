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
import {getStateValues} from '../redux/horizonStore';
import {Type} from './models';
import CategoryPicker from '../categories/CategoryPicker';
import CategoryEditor from '../categories/CategoryEditor';
import AccountPicker from '../comptes/AccountPicker';
import GroupPicker from '../groups/GroupPicker';
import GroupEditor from '../groups/GroupEditor';
import {WithHorizons} from '../core/horizon';
import * as muiForm from '../core/muiForm';
import {prepareElement, submitElement} from '../core/ElementEditor';
import {applyTemplate} from './templates/model';

const PAYMENT_TYPES = [
  {id: Type.CARTE, name: 'Carte'},
  {id: Type.MONNAIE, name: 'Monnaie'},
  {id: Type.CHEQUE, name: 'Chèque'},
  {id: Type.VIREMENT, name: 'Virement'}
];

const TODAY = new Date();
const DEFAULT_TRANSACTION = {
  object: '',
  type: Type.CARTE,
  date: TODAY
};

const TransactionEditor = reactStamp(React)
  .compose(WithHorizons)
  .compose({
    propTypes: {
      transaction: PropTypes.object,
      editorId: PropTypes.string.isRequired,
      onSubmit: PropTypes.func
    },
    defaultProps: {
      transaction: {},
      onSubmit: _.noop
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
      const ELEMENT_PROP = 'editedTransaction';
      instance.readEditedElement = function() {
        return this.props[ELEMENT_PROP];
      };

      const updater = newState => instance.props.edit(newState[ELEMENT_PROP]);
      instance.setModelValue = (...args) => muiForm.setModelValue(
        instance.props, ELEMENT_PROP, updater,
        ...args);
      instance.setModelFromInput = (...args) => muiForm.setModelFromInput(
        instance.props, ELEMENT_PROP, updater,
        ...args);
      instance.setModelFromChoice = (...args) => muiForm.setModelFromChoice(
        instance.props, ELEMENT_PROP, updater,
        ...args);

    },
    componentWillMount() {
      if (!_.isEmpty(this.props.transaction)) {
        const t = {
          ...this.props.transaction,
          date: new Date(this.props.transaction.date)
        };
        this.props.setUp(t);
      } else {
        this.props.setUp(DEFAULT_TRANSACTION);
      }
      this.props.loadLatestTransactions();
      this.props.loadTemplates();

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
        submit: this.submit.bind(this),
        startTransfer: this.transfer.bind(this),
        completeTransfer: this.transfer.bind(this, true),
        cancelTransfer: this.transfer.bind(this, false)
      });
    },
    makeStateTransaction(template) {
      const transaction = _.assign({}, DEFAULT_TRANSACTION, template);
      transaction.date = transaction.date !== undefined ?
        new Date(transaction.date) : new Date();
      return transaction;
    },
    getValue(key) {
      return this.props.editedTransaction[key]
        || this.props.transaction[key];
    },
    defineTransactionObject(chosenObject, idx) {
      const template = this.props.templates[idx - this.props.latestObjects.length];
      if (template !== undefined && chosenObject === `${template.object} [t]`) {
        const transaction = applyTemplate(
          {...DEFAULT_TRANSACTION, id: this.props.editedTransaction.id},
          template);
        this.props.edit(transaction);
      } else {
        // Just use the value without template
        this.setModelValue('object', chosenObject);
      }
    },
    getEditedElement() {
      return prepareElement(
        this.props.editedTransaction,
        this.props.transaction,
        (t) => this.formatEditedElement(t));
    },
    formatEditedElement(transaction) {
      if (transaction.date !== undefined) {
        transaction.date = transaction.date.getTime();
      }
      if (transaction.amount !== undefined) {
        transaction.amount = parseFloat(transaction.amount);
      }

      return transaction;
    },
    reset() { // Override from HorizonEditor
      const transaction = {
        ...DEFAULT_TRANSACTION,
        ...this.props.editedTransaction
      };
      // Remove changing props
      [
        'object',
        'amount',
        'group',
        'templateId'
      ].forEach(prop => { transaction[prop] = '';});

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
    submit() {
      submitElement(
        this.getEditedElement(),
        (transaction) => this.props.save(transaction),
        null,
        null);
      // TODO move this out of the editor
      this.props.onSubmit();
      this.reset();
    },
    transfer(execute, toAccount) {
      if (execute === true) {
        const transaction = this.getEditedElement();
        if (transaction.account !== toAccount) {
          const oppositeTransaction = Object.assign(
            {}, transaction, {amount: -transaction.amount, account: toAccount}
          );

          this.props.save(transaction);
          this.props.save(oppositeTransaction);
          this.setState({askTransferAccount: false});
          this.reset();
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
    renderObject() {
      const suggestions = [
        ...this.props.latestObjects,
        ...this.props.templates.map(t => `${t.object} [t]`)
      ];

      return <div>
        <AutoComplete
          hintText="Objet de la transaction"
          filter={AutoComplete.fuzzyFilter}
          searchText={this.props.editedTransaction.object || ''}
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
      return <SelectField
          value={this.props.editedTransaction.type || null}
          onChange={this.cbks.setType}
          floatingLabelText={'Moyen de payement'}
          floatingLabelFixed={true}>
        {PAYMENT_TYPES.map(value => <MenuItem key={value.id}
            value={value.id} primaryText={value.name} />)}
      </SelectField>;
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
          <CategoryEditor onSubmit={newCategory => this.cbks.setCategory(newCategory.id)} />
        </Dialog>,
        <Dialog key="group"
          title="Ajouter un group"
          modal={false} open={this.state.openGroupForm}
          onRequestClose={this.cbks.closeGroupForm}>
          <GroupEditor onSubmit={_.noop}
              editorId={`TransactioEditor-${this.props.editorId}-group-editor`}/>
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
      if (!this.props.editedTransaction) {
        return <p><i>Loading...</i></p>;
      }

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

const LATEST_TRANSACTIONS_KEY = 'transaction-editor-lastest-transactions';
const TEMPLATES_KEY = 'transaction-editor-templates';
function mapStateToProps(state, props) {
  const editedTransaction = getEditedValue(
    state.editors,
    props.editorId,
    undefined);
  const latestObjects = _(getStateValues(state.transactions, LATEST_TRANSACTIONS_KEY))
    .map(t => t.object)
    .uniq()
    .value();
  const templates = getStateValues(state.templates, TEMPLATES_KEY);

  return {
    ...props,
    editedTransaction,
    latestObjects,
    templates
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
    }),
    save: (transaction) => dispatch({
      type: actions.transactions.save,
      value: transaction
    }),
    loadLatestTransactions: () => dispatch({
      type: actions.transactions.query,
      queryId: LATEST_TRANSACTIONS_KEY,
      order: 'updatedAt descending',
      limit: 100
    }),
    loadTemplates: () => dispatch({
      type: actions.templates.query,
      queryId: TEMPLATES_KEY
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionEditor);
export {
  TransactionEditor
};
