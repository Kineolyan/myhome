import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {connect} from 'react-redux';

import TransactionEditor from './TransactionEditor';
import TransactionView from './TransactionView';

const Mode = {
  VIEW: 'view',
  EDIT: 'edit',
  SET_TEMPLATE: 'set-template'
};

class TransactionPanel extends React.Component {

  constructor(props) {
    super(props);

    this.state = {templates: []};
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.mode !== nextProps.mode) {
      if (nextProps.mode === Mode.SET_TEMPLATE) {
        this.templateStream = this.context.horizons.templates
          .watch()
          .subscribe(
            templates => this.setState({templates}),
            err => console.error('Cannot load templates', err));
      } else if (this.props.mode === Mode.SET_TEMPLATE) {
        this.templateStream.unsubscribe();
        this.templateStream = null;
        this.setState({templates: []});
      }
    }
  }

  associateTemplate(template) {
    this.context.horizons.transactions
      .update({
        id: this.props.transactionId,
        templateId: template.id
      })
      .subscribe(
        () => {
          console.log('Template applied to transaction');
          this.props.onSuccess();
        },
        err => console.error('Cannot apply template to transaction', err));
  }

  renderTemplateSetter() {
    const templates = _(this.state.templates)
      .sortBy(t => t.object)
      .map(template =>
        <li key={template.id}>
          <span style={{
            fontWeight: template.id === this.props.transaction.templateId
              ? 'bold'
              : 'normal'
            }}>{template.object}</span>
          &nbsp;
          <span onClick={() => this.associateTemplate(template)}>[Use]</span>
        </li>)
      .value();
    return <div style={{marginTop: 10}}>
        <div>Pick a template for the transaction</div>
        <ul>{templates}</ul>
      </div>;
  }

  render() {
    // TODO Pas la version maj après edit,
    // Bug pendant edition pour faire -
    if (this.props.mode === Mode.EDIT) {
      return <TransactionEditor transaction={this.props.transaction}
          onSubmit={this.props.onSuccess}/>;
    } else if (this.props.mode === Mode.SET_TEMPLATE) {
      return this.renderTemplateSetter();
    } else {
      return <TransactionView
        transaction={this.props.transaction}
        viewId={`TransactionPanel-${this.props.transaction.id}`}/>;
    }
  }
}

TransactionPanel.propTypes = {
  transactionId: PropTypes.string.isRequired,
  transaction: PropTypes.object,
  mode: PropTypes.oneOf(_.values(Mode)),
  onSuccess: PropTypes.func
};

TransactionPanel.defaultProps = {
  onSuccess: () => {}
};

TransactionPanel.contextTypes = {
  horizons: PropTypes.object
};

const mapStateToProps = (state, props) => {
	return {
		...props,
		transaction: state.transactions.values[props.transactionId]
	};
};

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TransactionPanel);
export {
  TransactionPanel,
  Mode
};
