import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import {Button} from 'antd';

import actions from '../redux/actions';
import * as dispatcher from '../redux/dispatcher';
import {getStateValues} from '../redux/horizonStore';

import DatePicker from 'material-ui/DatePicker';

import AccountPicker from '../comptes/AccountPicker';
import {asDate} from '../core/time';

const TODAY = new Date();
const toCsv = (transactions, categories) => {
	return 'Objet,Montant,Date,Categorie,Type\n' // Headers
		+ _(transactions)
			.map(t => `${t.object},${t.amount.toFixed(2)},${asDate(t.date)},${categories[t.category].name},${t.type}`)
			.join('\n');
};

class AccountExportActivity extends React.Component {

	constructor(props) {
		super(props);

		this.cbks = {
			setAccount: account => props.setState({account}),
			setFrom: (e, date) => props.setState({from: date}),
			setTo: (e, date) => props.setState({to: date}),
			export: () => this.export()
		};
	}

	export() {
		this.props.getTransactions(this.props.state.account, this.props.state.from, this.props.state.to);
	}

	isExportDefined(state) {
		return state.account !== null && state.from !== null && state.to !== null;
	}

	renderForm() {
		return (
			<div>
				<div>
					<AccountPicker value={this.props.state.account} onSelect={this.cbks.setAccount} />
				</div>
				<div>
          <DatePicker
            floatingLabelText="Début"
            value={this.props.state.from}
            maxDate={this.props.state.to}
            onChange={this.cbks.setFrom} autoOk={true}/>
					<DatePicker
						floatingLabelText="Fin"
						value={this.props.state.to}
						maxDate={TODAY}
						onChange={this.cbks.setTo} autoOk={true}/>
				</div>
				<div>
					<Button 
							type="primary"
							disabled={!this.isExportDefined(this.props.state)}
							onClick={this.cbks.export}>
						Exporter
					</Button>
				</div>
			</div>
		);
	}

	renderExport() {
		if (!_.isEmpty(this.props.transactions) && !_.isEmpty(this.props.categories)) {
			const data = toCsv(this.props.transactions, this.props.categories);
			const style = {
				width: '95%',
				height: 'calc(75vh - 250px)',
				marginTop: 10
			};
			return <textarea style={style} defaultValue={data} />;
		} else {
			return <p>No data in the export</p>;
		}
	}

	render() {
		return (
			<div>
				{this.renderForm()}
				{this.renderExport()}
			</div>
		);
	}

}

function stateToProps(state, props) {
  return {
    categories: _.keyBy(
			getStateValues(state.categories, 'export-categories'),
			'id'),
		transactions: getStateValues(state.transactions, 'export-transactions'),
		state: props.state
  };
}

function dispatchToProps(dispatch, props) {
  return {
		setState: dispatcher.setState(dispatch),
		getCategories: () => dispatch({
			type: actions.categories.query,
			queryId: 'export-categories'
		}),
    getTransactions: (accountId, from, to) => dispatch({
      type: actions.transactions.query,
      queryId: 'export-transactions',
			conditions: {account: accountId},
			above: [{date: from.getTime()}, 'closed'],
			below: [{date: to.getTime()}, 'closed']
    })
  };
}

const register = () => ({
	id: 'export',
	load(dispatch) {
		dispatcher.setState(dispatch)({
			account: null,
			from: TODAY,
			to: TODAY
		});
		dispatch({
			type: actions.categories.query,
			queryId: 'export-categories'
		});
	}
});

export default connect(stateToProps, dispatchToProps)(AccountExportActivity);
export {
	register
};
