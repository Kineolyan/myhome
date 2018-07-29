import React from 'react';
import {connect} from 'react-redux';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import actions from '../redux/actions';
import {getStateValues} from '../redux/horizonStore';

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

	componentDidMount() {
		this.props.startQuery({});
	}

  render() {
    return <div>
			<SelectTemplate
					value=''
					templates={this.props.templates}
					onSelected={() => {}} />
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
