import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import reactStamp from 'react-stamp';
import {connect} from 'react-redux';
import {AutoComplete, Button, DatePicker, Input, Modal} from 'antd';
import moment from 'moment';

import actions from '../redux/actions';
import {getEditedValue} from '../redux/editorStore';
import {getStateValues} from '../redux/horizonStore';
import {Type} from './models';
import TypePicker from './TypePicker';
import CategoryPicker from '../categories/CategoryPicker';
import CategoryEditor from '../categories/CategoryEditor';
import AccountPicker from '../comptes/AccountPicker';
import GroupPicker from '../groups/GroupPicker';
import GroupEditor from '../groups/GroupEditor';
import {WithHorizons} from '../core/horizon';
import * as muiForm from '../core/muiForm';
import {prepareElement, submitElement} from '../core/ElementEditor';
import {applyTemplate} from './templates/model';


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
        setType: this.setModelValue.bind(this, 'type'),
        setCategory: this.setModelValue.bind(this, 'category'),
        setGroup: this.setModelValue.bind(this, 'group'),
        setDate: (date) => this.setModelValue('date', date.toDate()),
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
        ...this.props.latestObjects.map(o => ({key: o, value: o, text: o})),
        ...this.props.templates.map(t => ({
          key: t.id,
          value: `#${t.id}`,
          text: `${t.object} [t]`
        }))
      ];
      // const suggestions = [
      //   ...this.props.latestObjects,
      //   ...this.props.templates.map(`${t.object} [t]`)
      // ];
      const filter = () => {};

      return <div>
        <AutoComplete
          placeholder="Objet de la transaction"
          searchText={this.props.editedTransaction.object || ''}
          dataSource={suggestions}
          onChange={this.cbks.setObject}
          onSelect={this.cbks.selectCompletedObject}
          onSearch={filter}
        />
      </div>;
    },
    renderAccount() {
      return <AccountPicker
        value={this.getValue('account')}
        onSelect={this.cbks.setAccount} />;
    },
    renderType() {
      return <TypePicker
          value={this.getValue('type') || null}
          onSelect={this.cbks.setType}/>;
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
        <Modal 
          key="category"
          title="Ajouter une catégorie"
          visible={this.state.openCategoryForm}
          onOk={this.cbks.closeCategoryForm}
          onCancel={this.cbks.closeCategoryForm}>
          <CategoryEditor onSubmit={newCategory => this.cbks.setCategory(newCategory.id)} />
        </Modal>,
        <Modal 
          key="group"
          title="Ajouter un group"
          visible={this.state.openGroupForm}
          onOk={this.cbks.closeGroupForm}
          onCancel={this.cbks.closeGroupForm}>
          <GroupEditor onSubmit={_.noop}
              editorId={`TransactioEditor-${this.props.editorId}-group-editor`}/>
        </Modal>,
        <Modal 
          key="transfer"
          title="Choisir le compte pour le transfert"
          visible={this.state.askTransferAccount}
          onOk={this.cbks.cancelTransfer}
          onCancel={this.cbks.cancelTransfer}>
          <AccountPicker onSelect={this.cbks.completeTransfer} />
        </Modal>
      ];
    },
    renderSubmitButtons() {
      const btns = [
        <Button key="save-btn" 
            type="primary"
            disabled={!this.canSubmit()}
            onClick={this.cbks.submit}>
          Sauver
        </Button>
      ];

      if (!this.getValue('id')) {
        btns.push(
          <Button key="transfer-btn"
              disabled={!this.canSubmit()}
              onClick={this.cbks.startTransfer}>
            Transférer
          </Button>);
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
          <Input placeholder="Montant de la transaction" type="number"
            value={this.props.editedTransaction.amount}
            onChange={this.cbks.setAmount} />
        </div>
        <div>
          <DatePicker
            placeholder="Date de la transaction"
            value={moment(this.props.editedTransaction.date)}
            onChange={this.cbks.setDate}/>
        </div>
        <div>
          {this.renderAccount()}
        </div>
        <div>
          {this.renderType()}
        </div>
        <div>
          {this.renderCategories()}
          <Button onClick={this.cbks.addCategory} 
            size="small" shape="circle" icon="plus"/>
        </div>
        <div>
          {this.renderGroups()}
          <Button onClick={this.cbks.addGroup} 
            size="small" shape="circle" icon="plus"/>
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
