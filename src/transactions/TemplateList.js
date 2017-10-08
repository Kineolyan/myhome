import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import actions from '../redux/actions';
import {getStateValues} from '../redux/horizonStore';

class TemplateList extends React.Component {

  componentWillMount() {
    this.props.startQuery({
      order: "date descending"
    });
    this.selection = this.feed.order('date', 'descending')
      .watch()
      .subscribe(
        templates => this.setState({templates}),
        err => {
          console.error('Cannot get templates', err);
          this.setState({templates: []});
        });
  }

  deleteTemplate(template) {
    const tId = template.id;
    this.feed.remove(tId)
      .subscribe(
        () => {
          console.log('Template removed');
          const transactionFeed = this.context.horizons.transactions;
          transactionFeed
            .findAll({templateId: tId})
            .fetch()
            .mergeMap(transactions => transactionFeed.update(
              transactions.map(transaction => ({
                id: transaction.id,
                templateId: null
              }))))
            .subscribe(
              () => console.log('Transactions unlinked from deleted template'),
              err => console.error('Failed to unlink transactions', err));
        },
        err => console.error('Failed to delete template', template, err));
  }

  get feed() {
    return this.context.horizons.templates;
  }

  render() {
    if (this.props.templates.length > 0) {
      return <ul>
        {this.props.templates.map(t => (
          <li key={t.id}>
            {t.id} -> {t.object} ({JSON.stringify(t.frequency)})
            <span onClick={() => this.deleteTemplate(t)}>&nbsp;(x)</span>
          </li>))}
      </ul>;
    } else {
      return <p>No templates</p>;
    }
  }
}

TemplateList.contextTypes = {
  horizons: PropTypes.object
};

const mapStateToProps = (state, props) => {
	const templates = getStateValues(state.templates, props.viewId);

	return {
		...props,
		templates
	};
};

const mapDispatchToProps = (dispatch, props) => ({
	startQuery(query) {
		return dispatch({
      type: actions.templates.query,
      queryId: props.viewId,
      ...query
    });
	},
	stopQuery() {}
});

export default connect(mapStateToProps, mapDispatchToProps)(TemplateList);
export {
  TemplateList
};
