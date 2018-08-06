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
				const name = `${t.object} (${JSON.stringify(t.frequency)})`;
				return <MenuItem key={id} value={id} primaryText={name} />;
			})
		}
	</SelectField>;

};

class TemplateActivity extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			editedTemplate: null
		};
	}

	componentDidMount() {
		this.props.startQuery({});
	}

	// componentDidUpdate() {
	// 	const wantedId = this.props.context.id;
	// 	const currentId = this.state.
	// 	if (this.state.editedTemplate === mull 
	// 		|| this.props.editedTemplate.id !== ) {
	// 		const template = this.props.templates.find(t => t.id === this.props.context,id)
	// 	}
	// }

  render() {
    return <div>
			<SelectTemplate
					value=''
					templates={this.props.templates}
					onSelected={(idx) => this.setState({
						editedTemplate: _.cloneDeep(this.props.templates[idx])
					})} />
			{
				this.state.editedTemplate
						? <div>Template id: {this.state.editedTemplate.id}</div>
						: null
			}
			{
				this.state.editedTemplate
						? <TemplateEditor
								template={this.state.editedTemplate}
								editorId="template-activity-editor"
								onSubmit={() => this.setState({editedTemplate: null})}/>
						: null
			}
    </div>;
  }

}

const REDUX_ID = 'template-activity';
const mapStateToProps = (state, props) => {
	const templates = getStateValues(state.templates, REDUX_ID);

	return {
		...props,
		templates
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
