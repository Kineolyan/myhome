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
  }

  deleteTemplate(template) {
    this.props.deleteTemplate(template.id);
  }

  render() {
    if (this.props.templates.length > 0) {
      return <ul>
        {this.props.templates.map(t => (
          <li key={t.id}>
            <span onClick={() => this.deleteTemplate(t)}>(x)&nbsp;</span>
            {t.id} -> {t.object} ({JSON.stringify(t.frequency)})
          </li>))}
      </ul>;
    } else {
      return <p>No templates</p>;
    }
  }
}

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
  stopQuery() {},
  deleteTemplate: (templateId) => dispatch({
    type: actions.templates.delete,
    queryId: `TemplateList-delete-${templateId}`,
    templateId 
  })
});

export default connect(mapStateToProps, mapDispatchToProps)(TemplateList);
export {
  TemplateList
};
