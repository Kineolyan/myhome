import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import {auditItem} from './core/auditActions';
import AccountEditor from './comptes/AccountEditor';
import AccountList from './comptes/AccountList';
import CategoryList from './categories/CategoryList';
import CategoryEditor from './categories/CategoryEditor';
import TransactionList from './transactions/TransactionList';
import TransactionEditor from './transactions/TransactionEditor';
import TransactionHistory from './transactions/TransactionHistory';
import TransactionActivity from './activities/TransactionActivity';

class Messages extends Component {
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

class Showcase extends Component {
  render() {
    return <div style={{borderTop: 'solid 2px #000'}}>
      <h3>Showcase</h3>
      <div className="grid">
        <div className="block">
          <Messages />
        </div>
        <div className="block">
          <AccountEditor onSubmit={account => {
            console.log('new account', account);
            auditItem(account);

            this.context.horizons.accounts
              .store(account).subscribe(
                result => console.log('Saved account', result),
                error => console.log('[Failure] account', error)
              );
          }} />
        </div>
        <div className="block">
          <AccountList />
        </div>
        <div className="block">
          <CategoryEditor />
          <CategoryList />
        </div>
        <div className="block">
          <TransactionEditor />
        </div>
        <div className="block">
          <TransactionList />
        </div>
        <div className="block">
          <TransactionHistory />
        </div>
      </div>
    </div>;
  }
}

const AccountActivity = () => <p>AccountActivity</p>;

class RouterApp extends Component {
  render() {
    return <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={AccountActivity} />
        <Route path="comptes" component={AccountActivity}/>
        <Route path="comptes/edit" component={TransactionActivity}/>
        <Route path="*" component={Showcase}/>
      </Route>
    </Router>;
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <p>
          <Link to={`/comptes`}>Comptes</Link>&nbsp;
          <Link to={`/comptes/edit`}>Ajouter</Link>
          <Link to={`/showcase`}>Show case</Link>
        </p>

        {this.props.children}
      </div>
    );
  }
}

export default App;
export {
  RouterApp
};
