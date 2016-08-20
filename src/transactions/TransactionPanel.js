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
    const view = this.state.edit ?
      <TransactionEditor transaction={this.props.transaction}
        onSubmit={this.cbks.closeEditor}/> :
      <TransactionView transaction={this.props.transaction} />;

    // TODO Pas la version maj après edit,
    // Bug pendant edition pour faire -
    // Pas de bouton pour fermer
    return <div>
      <FlatButton label="Edit"
        onClick={this.cbks.openEditor} />
      {view}
    </div>;
  }

}

TransactionPanel.propTypes = {
  transaction: React.PropTypes.object.isRequired
};

export default TransactionPanel;
