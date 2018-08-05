import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {connect} from 'react-redux';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';
import Dialog from 'material-ui/Dialog';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import actions from '../../redux/actions';
import {getEditedValue} from '../../redux/editorStore';
import {Type} from '../models';
import CategoryPicker from '../../categories/CategoryPicker';
import CategoryEditor from '../../categories/CategoryEditor';
import AccountPicker from '../../comptes/AccountPicker';
import * as muiForm from '../../core/muiForm';
import {prepareElement, submitElement} from '../../core/ElementEditor';

const PAYMENT_TYPES = [
  {id: Type.CARTE, name: 'Carte'},
  {id: Type.MONNAIE, name: 'Monnaie'},
  {id: Type.CHEQUE, name: 'Chèque'},
  {id: Type.VIREMENT, name: 'Virement'}
];
const TEMPLATE_TYPES = [
  {id: 'frequency', name: 'Fréquence'},
  {id: 'template', name: 'Template'},
];

const TODAY = new Date();

const getValue = (props, key) => props.editedTemplate[key] || props.template[key];

const initializeElement = (props) => {
	const t = {
		...props.template,
		date: new Date(props.template.date)
	};
	props.setUp(t);
};
const getEditedElement = (props) => {
	return prepareElement(
		props.editedTemplate,
		props.template,
		(t) => formatEditedElement(t));
};
const formatEditedElement = (template) => {
	if (template.date !== undefined) {
		template.date = template.date.getTime();
	}
	if (template.amount !== undefined) {
		template.amount = parseFloat(template.amount);
	}

	return template;
};
const canSubmit = (props) => {
	const template = getEditedElement(props);
	return !_.isEmpty(template.object)
		&& template.type
		&& template.category;
};
const submit = (props) => {
	submitElement(
		getEditedElement(props),
		(template) => props.save(template),
		null,
		null);
	// TODO move this out of the editor
	props.onSubmit();
};

/* -- Sub-components -- */

const TemplateObject = (props) => {
	return <div>
		<TextField
			hintText="Objet de la transaction"
			value={props.editedTemplate.object}
			onChange={props.setObject} />
	</div>;
};
const TemplateAccount = (props) => {
	return <AccountPicker
		value={getValue(props, 'account')}
		onSelect={props.setAccount} />;
};
const TemplateType = (props) => {
	return <SelectField
			value={props.type || null}
			onChange={props.setType}
			floatingLabelText={'Type de template'}
			floatingLabelFixed={true}>
		{TEMPLATE_TYPES.map(value => <MenuItem key={value.id}
				value={value.id} primaryText={value.name} />)}
	</SelectField>;
};
const TemplatePayment = (props) => {
	return <SelectField
			value={props.editedTemplate.type || null}
			onChange={props.setType}
			floatingLabelText={'Moyen de payement'}
			floatingLabelFixed={true}>
		{PAYMENT_TYPES.map(value => <MenuItem key={value.id}
				value={value.id} primaryText={value.name} />)}
	</SelectField>;
};
const TemplateCategories = (props) => {
	return <CategoryPicker
		value={getValue(props, 'category')}
		onSelect={props.setCategory} />;
};
const TemplateForms = (props) => {
	return [
		<Dialog key="category"
			title="Ajouter une catégorie"
			modal={false} open={props.isOpen}
			onRequestClose={props.closeCategoryForm}>
			<CategoryEditor onSubmit={newCategory => props.setCategory(newCategory.id)} />
		</Dialog>
	];
};
const TemplateSubmitButtons = (props) =>
	<div>
		<RaisedButton key="save-btn" label="Sauver" primary={true}
			disabled={!canSubmit(props)}
			onClick={props.submit} />
	</div>;

const ELEMENT_PROP = 'editedTemplate';
class TemplateEditor extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			openCategoryForm: false,
		};
	}

	componentDidMount() {
		if (!_.isEmpty(this.props.template)) {
			initializeElement(this.props);
		} else {
			this.props.setUp({
				object: '',
				type: Type.CARTE,
				date: TODAY
			});
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (!_.isEqual(prevProps.template, this.props.template)) {
			initializeElement(this.props);
		}
	}

	toggleCategoryForm(open) {
		this.setState({openCategoryForm: open});
	}

	render() {
		return this.doRender(this.props);
	}

	doRender(props) {
		const updater = newState => props.edit(newState[ELEMENT_PROP]);
		const setModelValue = (...args) => muiForm.setModelValue(
			props, ELEMENT_PROP, updater,
			...args);
		const setModelFromInput = key => (...args) => muiForm.setModelFromInput(
			props, ELEMENT_PROP, updater,
			key,
			...args);
		const setModelFromChoice = key => (...args) => muiForm.setModelFromChoice(
			props, ELEMENT_PROP, updater,
			key,
			...args);

		if (!props.editedTemplate) {
			return <p><i>Loading...</i></p>;
		}

		return <div>
			<TemplateForms
					isOpen={this.state.openCategoryForm}
					closeCategoryForm={() => this.toggleCategoryForm(false)}/>
			<TemplateObject
					setObject={setModelFromInput('object')}
					{...props}/>
			<div>
				<TextField hintText="Montant de la transaction" type="number"
					value={props.editedTemplate.amount}
					onChange={setModelFromInput('amount')} />
			</div>
			<div>
				<DatePicker
					hintText="Date de la transaction"
					value={props.editedTemplate.date}
					maxDate={TODAY}
					onChange={setModelFromInput('date')}
					autoOk={true}/>
			</div>
			<div>
				<TemplateAccount
						setAccount={value => setModelValue('account')}
						{...props} />
			</div>
			<div>
				<TemplatePayment
						setType={setModelFromChoice('type')}
						{...props} />
			</div>
			<div>
				<TemplateCategories
						setCategory={category => setModelValue('category')}
						{...props} />
				<FloatingActionButton
						onTouchTap={() => this.toggleCategoryForm(true)}
						mini={true}>
					<ContentAdd />
				</FloatingActionButton>
			</div>
			<TemplateSubmitButtons
					submit={() => submit(props)}
					{...props} />
		</div>;
	}

}

TemplateEditor.propsTypes = {
	template: PropTypes.object,
	editorId: PropTypes.string.isRequired,
	onSubmit: PropTypes.func
};
TemplateEditor.defaultProps = {
	template: {},
	onSubmit: _.noop
};

function mapStateToProps(state, props) {
  const editedTemplate = getEditedValue(
    state.editors,
    props.editorId,
    undefined);

  return {
    ...props,
    editedTemplate
  };
}

function mapDispatchToProps(dispatch, props) {
  return {
    setUp: template => dispatch({
      type: actions.editors.setup,
      editorId: props.editorId,
      value: template
    }),
    edit: template => dispatch({
      type: actions.editors.edit,
      editorId: props.editorId,
      value: template
    }),
    save: (template) => dispatch({
      type: actions.templates.save,
      value: template
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TemplateEditor);
export {
  TemplateEditor
};
