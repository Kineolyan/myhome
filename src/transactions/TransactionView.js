import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {asDate} from '../core/time';
import actions from '../redux/actions';

class TransactionView extends React.Component {
  get transaction() {
    return this.props.transaction;
  }

  componentWillMount() {
    this.props.getAccount();
    this.props.getCategory();
    if (this.props.transaction) {
      this.props.getGroup();
    }
  }

  renderGroup() {
    if (this.transaction.group) {
      return <p>
        Groupe: {this.props.group.name || this.transaction.group}
      </p>;
    }
  }

  renderTemplateId() {
    if (this.transaction.templateId) {
      const clickHandler = e => {
        e.preventDefault();
        this.props.linkToTemplate(this.transaction.templateId);
      };
      return [
        <br key="template-br"/>,
        <span key="template-info">
          Based on template <u className="fake-link" onClick={clickHandler}>{this.transaction.templateId}</u>
        </span>
      ];
    }
  }

  render() {
    return <div>
      <p>{this.transaction.object} le {asDate(this.transaction.date)}<br/>
      Montant de {this.transaction.amount} €
      </p>
      <p>
        Compte : {this.props.account.name || this.transaction.account}
      </p>
      <p>
        Catégorie : {this.props.category.name || this.transaction.category}
      </p>
      <p>
        Type de payement : {this.transaction.type}
      </p>
      {this.renderGroup()}
      <p style={{fontStyle: 'italic', fontSize: '0.8em'}}>
        Créée le {asDate(this.transaction.createdAt)}, mise à jour le {asDate(this.transaction.updatedAt)}
        {this.renderTemplateId()}
      </p>
    </div>;
  }
}

TransactionView.propTypes = {
  viewId: PropTypes.string.isRequired,
  transaction: PropTypes.object.isRequired
};

TransactionView.defaultProps = {
  account: {},
  category: {},
  group: {}
};

const getQueryId = (viewId, element) => `TransactionView-${viewId}-${element}`;
const accountQueryId = props => getQueryId(props.viewId, 'account');
const categoryQueryId = props => getQueryId(props.viewId, 'category');
const groupQueryId = props => getQueryId(props.viewId, 'group');

function stateToProps(state, props) {
  return {
    account: state.accounts.values[props.transaction.account],
    category: state.categories.values[props.transaction.category],
    group: state.groups.values[props.transaction.group]
  };
}

function dispatchToProps(dispatch, props) {
  return {
    getAccount: () => dispatch({
      type: actions.accounts.query,
      queryId: accountQueryId(props),
      element: props.transaction.account
    }),
    getCategory: () => dispatch({
      type: actions.categories.query,
      queryId: categoryQueryId(props),
      element: props.transaction.category
    }),
    getGroup: () => dispatch({
      type: actions.groups.query,
      queryId: groupQueryId(props),
      element: props.transaction.group
    }),
    linkToTemplate: (templateId) => dispatch({
      type: actions.location.goto,
      context: {
        entity: 'templates',
        id: templateId
      }
    })
  };
}

export default connect(stateToProps, dispatchToProps)(TransactionView);
export {
  TransactionView
};
