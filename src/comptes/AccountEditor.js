import React from 'react';
import _ from 'lodash';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class AccountEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      edited: {}
    };
  }

  componentWillMount() {
    this.cbks = {
      setName: this.setModel.bind(this, 'name'),
      submit: this.submit.bind(this)
    };
  }

  setModel(key, event, value) {
    const account = this.state.edited;
    if (!_.isEmpty(value)) {
      account[key] = value;
    } else {
      Reflect.deleteProperty(account, key);
    }

    this.setState({edited: account});
  }

  submit() {
    this.props.onSubmit(this.state.edited);
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
  account: React.PropTypes.object
};

AccountEditor.defaultProps = {
  account: {}
};

export default AccountEditor;
