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

import {TemplateType, Frequency, detectType} from './model';

const PAYMENT_TYPES = [
  {id: Type.CARTE, name: 'Carte'},
  {id: Type.MONNAIE, name: 'Monnaie'},
  {id: Type.CHEQUE, name: 'Chèque'},
  {id: Type.VIREMENT, name: 'Virement'}
];
const TEMPLATE_TYPES = [
  {id: TemplateType.FREQUENCY, name: 'Fréquence'},
  {id: TemplateType.PREFILL, name: 'Pre-remplissage'},
];
const FREQUENCIES = [
  {id: Frequency.MONTHLY, name: 'Tous les mois'}
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
const transformType = (template, newType) => {
	const prevType = detectType(template);
	if (newType !== prevType) {
		const newTemplate = {...template};
		switch (prevType) {
		case TemplateType.FREQUENCY:
			Reflect.deleteProperty(newTemplate, 'frequency');
			break;
		case TemplateType.PREFILL: break; // Nothing to do
		default: throw new Error(`Unsupported type ${prevType}`);
		}

		switch (newType) {
		case TemplateType.PREFILL: break; // Nothing to do
		case TemplateType.FREQUENCY:
			newTemplate.frequency = {type: Frequency.MONTHLY};
			break;
		default: throw new Error(`Unsupported type ${prevType}`);
		}

		return newTemplate;
	} else {
		return template;
	}
};
const canSubmitFrequencyTemplate = (props) => {
	const template = getEditedElement(props);
	return !_.isEmpty(template.object)
		&& template.type
		&& template.category;
};
const canSubmitPrefillTemplate = (props) => {
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

const ObjectField = (props) => {
	return <div>
		<TextField
			hintText="Objet de la transaction"
			value={props.editedTemplate.object}
			onChange={props.setObject} />
	</div>;
};
const AccountField = (props) => {
	return <AccountPicker
		value={getValue(props, 'account')}
		onSelect={props.setAccount} />;
};
const PaymentSelector = (props) => {
	return <SelectField
			value={props.editedTemplate.type || null}
			onChange={props.setType}
			floatingLabelText={'Moyen de payement'}
			floatingLabelFixed={true}>
		{PAYMENT_TYPES.map(value => <MenuItem key={value.id}
				value={value.id} primaryText={value.name} />)}
	</SelectField>;
};
const CategorySelector = (props) => {
	return <CategoryPicker
		value={getValue(props, 'category')}
		onSelect={props.setCategory} />;
};
const Forms = (props) => {
	return [
		<Dialog key="category"
			title="Ajouter une catégorie"
			modal={false} open={props.isOpen}
			onRequestClose={props.closeCategoryForm}>
			<CategoryEditor onSubmit={newCategory => props.setCategory(newCategory.id)} />
		</Dialog>
	];
};
const SubmitButtons = (props) =>
	<div>
		<RaisedButton key="save-btn" label="Sauver" primary={true}
			disabled={!props.canSubmit(props)}
			onClick={props.submit} />
	</div>;
const FrequencySelector = (props) => {
	return <SelectField
			value={props.frequency || ''}
			onChange={props.setFrequency}
			floatingLabelText={'Fréquence'}
			floatingLabelFixed={true}>
		{FREQUENCIES.map(value => <MenuItem key={value.id}
				value={value.id} primaryText={value.name} />)}
	</SelectField>;
};

const FrequencyEditor = (props) => {
	const updater = newState => props.edit(newState[ELEMENT_PROP]);
	const setModelValue = key => (...args) => muiForm.setModelValue(
		props, ELEMENT_PROP, updater,
		key,
		...args);
	const setModelFromInput = key => (...args) => muiForm.setModelFromInput(
		props, ELEMENT_PROP, updater,
		key,
		...args);
	const setModelFromChoice = key => (...args) => muiForm.setModelFromChoice(
		props, ELEMENT_PROP, updater,
		key,
		...args);

	return <div>
		<Forms
				isOpen={props.openCategoryForm}
				closeCategoryForm={() => props.toggleCategoryForm(false)}/>
		<ObjectField
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
			<FrequencySelector 
				frequency={props.editedTemplate.frequency.type}
				setFrequency={setModelFromChoice('frequency.type')} />
		</div>
		<div>
			<AccountField
					setAccount={setModelValue('account')}
					{...props} />
		</div>
		<div>
			<PaymentSelector
					setType={setModelFromChoice('type')}
					{...props} />
		</div>
		<div>
			<CategorySelector
					setCategory={setModelValue('category')}
					{...props} />
			<FloatingActionButton
					onTouchTap={() => props.toggleCategoryForm(true)}
					mini={true}>
				<ContentAdd />
			</FloatingActionButton>
		</div>
		<SubmitButtons
				canSubmit={() => canSubmitFrequencyTemplate(props)}
				submit={() => submit(props)}
				{...props} />
	</div>;
};
const PreFillEditor = (props) => {
	const updater = newState => props.edit(newState[ELEMENT_PROP]);
	const setModelValue = key => value => muiForm.setModelValue(
		props, ELEMENT_PROP, updater, key, value, true);
	const setModelFromInput = key => (...args) => muiForm.setModelFromInput(
		props, ELEMENT_PROP, updater,
		key,
		...args);
	const setModelFromChoice = key => (...args) => muiForm.setModelFromChoice(
		props, ELEMENT_PROP, updater,
		key,
		...args);

	return <div>
		<Forms
				isOpen={props.openCategoryForm}
				closeCategoryForm={() => props.toggleCategoryForm(false)}/>
		<ObjectField
				setObject={setModelFromInput('object')}
				{...props}/>
		<div>
			<TextField hintText="Montant de la transaction" type="number"
				value={props.editedTemplate.amount}
				onChange={setModelFromInput('amount')} />
		</div>
		<div>
			<AccountField
					setAccount={setModelValue('account')}
					{...props} />
		</div>
		<div>
			<PaymentSelector
					setType={setModelFromChoice('type')}
					{...props} />
		</div>
		<div>
			<CategorySelector
					setCategory={setModelValue('category')}
					{...props} />
			<FloatingActionButton
					onTouchTap={() => props.toggleCategoryForm(true)}
					mini={true}>
				<ContentAdd />
			</FloatingActionButton>
		</div>
		<SubmitButtons
				canSubmit={() => canSubmitPrefillTemplate(props)}
				submit={() => submit(props)}
				{...props} />
	</div>;
};

const TypeSelector = (props) => {
	return <SelectField
			value={props.type || null}
			onChange={props.setType}
			floatingLabelText={'Type de template'}
			floatingLabelFixed={true}>
		{TEMPLATE_TYPES.map(value => <MenuItem key={value.id}
				value={value.id} primaryText={value.name} />)}
	</SelectField>;
};
const EditorSwitch = (props) => {
	switch(props.type) {
		case TemplateType.FREQUENCY: return <FrequencyEditor {...props} />;
		case TemplateType.PREFILL: return <PreFillEditor {...props} />;
		default: return <p>Unsupported type {props.type}</p>;
	}
};

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
		return this.doRender({
			openCategoryForm: this.state.openCategoryForm,
			toggleCategoryForm: visible => this.toggleCategoryForm(visible),
			...this.props
		});
	}

	doRender(props) {
		if (!props.editedTemplate) {
			return <p><i>Loading...</i></p>;
		} else {
			const setType = (type) => {
				const template = transformType(props.editedTemplate, type);
				props.edit(template);
			};
			return <div>
				<TypeSelector type={props.type} setType={(e, i, type) => setType(type)} />
				<EditorSwitch {...props} />
			</div>;
		}
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
		editedTemplate,
		type: detectType(editedTemplate)
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
