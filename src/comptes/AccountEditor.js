import React from 'react';
import _ from 'lodash';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import {auditItem} from '../core/auditActions';

class AccountEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      account: {}
    };
  }

  componentWillMount() {
    this.cbks = {
      setName: this.setModel.bind(this, 'name'),
      submit: this.submit.bind(this)
    };
  }

  get feed() {
    return this.context.horizons.accounts;
  }

  setModel(key, event, value) {
    const account = this.state.account;
    if (!_.isEmpty(value)) {
      account[key] = value;
    } else {
      Reflect.deleteProperty(account, key);
    }

    this.setState({ account });
  }

  getEditedAccount() {
    const account = _.clone(this.state.account);
    if (this.props.account.id !== undefined) {
      account.id = this.props.account.id;
    }

    return auditItem(account);
  }

  saveAccount(account) {
    return new Promise((resolve, reject) => {
      const action = account.id === undefined ?
        this.feed.store(account) : this.feed.update(account);
      action.subscribe(resolve, reject);
    });
  }

  resetAccount() {
    this.setState({ account: {} })
  }

  submit() {
    const account = this.getEditedAccount();
    this.saveAccount(account).then(() => this.resetAccount());
  }

  render() {
    return <div>
      <div>
        <TextField defaultValue={this.props.account.name}
          hintText="Nom du compte"
          onChange={this.cbks.setName}/>
      </div>
      <div>
        <RaisedButton label="Enregistrer" primary={true}
          onClick={this.cbks.submit} />
      </div>
    </div>;
  }
}

AccountEditor.propTypes = {
  account: React.PropTypes.object,
  onSubmit: React.PropTypes.func
};

AccountEditor.defaultProps = {
  account: {},
  onSubmit: _.noop
};

AccountEditor.contextTypes = {
  horizons: React.PropTypes.object
};

export default AccountEditor;
