import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import actions from '../redux/actions';
import {getStateValues} from '../redux/horizonStore';
import TemplateEditor from '../transactions/templates/TemplateEditor';

const SelectTemplate = ({templates, value, onSelected}) => {
	return <SelectField
			value={value || ''}
			onChange={(event, index) => onSelected(index)}
			hintText={'Select a template'}
			floatingLabelFixed={true}>
		{
			templates.map((t) => {
				const id = t.id;
				const info = t.frequency ? ` (${JSON.stringify(t.frequency)})` : '';
				const name = `${t.object}${info}`;
				return <MenuItem key={id} value={id} primaryText={name} />;
			})
		}
	</SelectField>;

};

class TemplateActivity extends React.Component {

	componentDidMount() {
		this.props.startQuery({});
	}

  render() {
		return this.doRender(this.props);
	}

	doRender(props) {
		if (_.isEmpty(props.templates)) {
			return <div>Loading...</div>;
		}

    return <div>
			<SelectTemplate
					value=''
					templates={this.props.templates}
					onSelected={(idx) => props.setState({
						templateId: props.templates[idx].id
					})} />
			{
				props.editedTemplate
						? <div>Template id: {props.editedTemplate.id}</div>
						: null
			}
			{
				props.editedTemplate
						? <TemplateEditor
								template={props.editedTemplate}
								editorId="template-activity-editor"
								onSubmit={() => props.setState({templateId: null})}/>
						: null
			}
    </div>;
  }

}

const REDUX_ID = 'template-activity';
const mapStateToProps = (state, props) => {
	const templates = getStateValues(state.templates, REDUX_ID);
	const templateId = props.state.templateId || props.context.id;
	const editedTemplate = templateId !== undefined
		? templates.find(t => t.id === templateId)
		: null;

	return {
		templates,
		templateId,
		editedTemplate
	};
};

const mapDispatchToProps = (dispatch, props) => ({
	startQuery(query) {
		return dispatch({
      type: actions.templates.query,
      queryId: REDUX_ID,
      ...query
    });
	},
	stopQuery() {},
	setState: (state) => dispatch({
		type: actions.activity.setState,
		state
	}),
  deleteTemplate: (templateId) => dispatch({
    type: actions.templates.delete,
    queryId: `${REDUX_ID}-delete-${templateId}`,
    templateId
  })
});

export default connect(mapStateToProps, mapDispatchToProps)(TemplateActivity);
export {
  TemplateActivity
};
