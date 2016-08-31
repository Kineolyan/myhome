import React from 'react';
import _ from 'lodash';

import FlatButton from 'material-ui/FlatButton';

import TransactionEditor from './TransactionEditor';
import TransactionView from './TransactionView';

const Mode = {
  VIEW: 'view',
  EDIT: 'edit'
};

class TransactionPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      edit: this.props.mode === Mode.EDIT
    };
  }

  componentWillMount() {
    this.cbks = {
      openEditor: () => this.setState({edit: true}),
      closeEditor: () => this.setState({edit: false})
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({edit: nextProps.mode === Mode.EDIT});
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
      const modeBts = this.props.mode === undefined ?
        <FlatButton label="Edit" onTouchTap={this.cbks.openEditor} /> : null;

      return <div>
        {modeBts}
        <TransactionView transaction={this.props.transaction} />
      </div>;
    }
  }
}

TransactionPanel.propTypes = {
  transaction: React.PropTypes.object.isRequired,
  mode: React.PropTypes.oneOf(_.values(Mode))
};

export default TransactionPanel;
export {
  Mode
};
