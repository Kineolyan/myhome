import React from 'react';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import AccountPicker from '../AccountPicker';
import AccountBalance from './AccountBalance';
import TransactionsView from '../../transactions/TransactionsView';

class AccountValidator extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			account: null,
			balance: null
		};

		this.cbks = {
			setAccount: this.setAccount.bind(this),
			setBalance: this.setBalance.bind(this),
			validate: this.validate.bind(this)
		}
	}

	get validationFeed() {
		return this.context.horizons.validations;
	}

	setAccount(account) {
		this.setState({account});
	}

	setBalance(event, value) {
		this.setState({balance: parseFloat(value)});
	}

	validate() {
		const validation = {
			account: this.state.account,
			balance: this.state.balance,
			validatedAt: Date.now(),
			validationDate: Date.now() 
		};
		this.validationFeed.store(validation).subscribe(
			() => console.log('Account balanced validated'),
			error => console.error('[Failure] Account validation', error) 
		);
	}

	render() {
		return <div>
			<div>
				<AccountPicker value={this.state.account}
					onSelect={this.cbks.setAccount} />
				<TextField type="number" hintText="Solde du compte"
					value={this.state.balance}
					onChange={this.cbks.setBalance} />
				<RaisedButton label="Valider" primary={true} 
					onTouchTap={this.cbks.validate}/>
			</div>
			<div>
				{this.state.account ? <AccountBalance account={this.state.account}/> : null}
			</div>
		</div>;
	}

}

AccountValidator.contextTypes = {
	horizons: React.PropTypes.shape({
		validations: React.PropTypes.object
	})
};

export default AccountValidator;