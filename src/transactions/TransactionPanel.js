import React from 'react';

import FlatButton from 'material-ui/FlatButton';

import TransactionEditor from './TransactionEditor';
import TransactionView from './TransactionView';

class TransactionPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      edit: false
    };
  }

  componentWillMount() {
    this.cbks = {
      openEditor: () => this.setState({edit: true}),
      closeEditor: () => this.setState({edit: false})
    };
  }

  render() {
    // TODO Pas la version maj après edit,
    // Bug pendant edition pour faire -
    if (this.state.edit) {
      return <div>
        <TransactionEditor transaction={this.props.transaction}
          onSubmit={this.cbks.closeEditor}/>
      </div>;
    } else {
      return <div>
        <TransactionView transaction={this.props.transaction} />
        <FlatButton label="Edit"
          onClick={this.cbks.openEditor} />
      </div>;
    }
  }

}

TransactionPanel.propTypes = {
  transaction: React.PropTypes.object.isRequired
};

export default TransactionPanel;
