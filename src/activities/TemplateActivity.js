import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import {Select} from 'antd';

import actions from '../redux/actions';
import {getStateValues} from '../redux/horizonStore';
import TemplateEditor from '../transactions/templates/TemplateEditor';

const SelectTemplate = ({templates, value, onSelected}) => {
	const options = _(templates)
		.sortBy(t => t.object)
		.map((t) => {
			const id = t.id;
			const info = t.frequency ? ` (${JSON.stringify(t.frequency)})` : '';
			const name = `${t.object}${info}`;
			return <Select.Option key={id} value={id}>{name}</Select.Option>;
    })
		.value();

		const filterOption = (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
		return (
			<Select
					showSearch={true}
					style={{ width: 400 }}
					placeholder="Selectionner un template"
					optionFilterProp="children"
					onChange={(id) => onSelected(id)}
					filterOption={filterOption}
					value={value || ''}>
				{options}
			</Select>
		);
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
					value={props.state.templateId}
					templates={this.props.templates}
					onSelected={(templateId) => props.setState({templateId})} />
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
