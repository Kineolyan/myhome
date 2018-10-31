import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import {Select} from 'antd';

import actions from '../redux/actions';
import * as dispatcher from '../redux/dispatcher';
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
				style={{ width: 200 }}
				placeholder="Selectionner un template"
				optionFilterProp="children"
				onChange={onSelected}
				filterOption={filterOption}
				value={value || ''}>
			{options}
		</Select>
	);

};

class TemplateActivity extends React.Component {

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
					templates={props.templates}
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
	startQuery: dispatcher.startQuery({dispatch, queryId: REDUX_ID}),
	stopQuery: dispatcher.stopQuery({dispatch, queryId: REDUX_ID}),
	setState: dispatcher.setState(dispatch),
  deleteTemplate: (templateId) => dispatch({
    type: actions.templates.delete,
    queryId: `${REDUX_ID}-delete-${templateId}`,
    templateId
  })
});

const register = () => ({
	id: 'templates',
	load(dispatch) {
		dispatcher.startQuery({dispatch, queryId: REDUX_ID})({});
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(TemplateActivity);
export {
	TemplateActivity,
	register
};
