import React from 'react';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class Messages extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      value: ''
    };
  }

  get messages() {
    return this.context.horizons.messages;
  }

  componentWillMount() {
    // Subscribe to messages
    this.messages.order('datetime', 'descending').limit(5).watch()
    .subscribe(
      allMessages => this.setState({ messages: [...allMessages].reverse()}),
      error => console.log(error)
    )
  }

  sendMessage() {
    if (this.state.value === '') {
      return;
    }

    this.messages.store({
      text: this.state.value, // Current value inside <input> tag
      datetime: new Date() // Warning clock skew!
    }).subscribe(
      // Returns id of saved objects
      result => console.log(result),
      // Returns server error message
      error => console.log(error)
    );

    this.setState({value: ''});
  }

  render() {
    return <div>
      <div>
        <TextField hintText="Message"
          value={this.state.value}
          onChange={(e, value) => this.setState({value})} />
          <RaisedButton label="Continuer" primary={true} style={{margin: 12}}
            onClick={() => this.sendMessage(this)}/>
      </div>
      <ul>
        {this.state.messages
          .map(m => <li key={m.id}>{m.text}</li>)}
      </ul>
    </div>;
  }
}

Messages.contextTypes = {
  horizons: React.PropTypes.object
};

export default Messages;
