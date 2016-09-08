import React, { Component } from 'react';
import './App.css';

import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

import AccountEditor from './comptes/AccountEditor';
import AccountList from './comptes/AccountList';
import CategoryList from './categories/CategoryList';
import CategoryEditor from './categories/CategoryEditor';
import TransactionList from './transactions/TransactionList';
import TransactionEditor from './transactions/TransactionEditor';
import TransactionHistory from './transactions/TransactionHistory';
import TransactionActivity from './activities/TransactionActivity';
import AccountActivity from './activities/AccountActivity';

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
          <AccountEditor />
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

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openMenu: false
    };

    this.cbks = {
      toggleMenu: this.toggleMenu.bind(this),
      openMenu: this.toggleMenu.bind(this, true),
      closeMenu: this.toggleMenu.bind(this, false)
    };
  }

  toggleMenu(open) {
    this.setState({openMenu: open});
  }

  renderMenu() {
    return <Drawer
        docked={false}
        width={200}
        open={this.state.openMenu}
        onRequestChange={this.cbks.toggleMenu}>
      <Link to={`/comptes`}>
        <MenuItem onTouchTap={this.cbks.closeMenu}>Comptes</MenuItem>
      </Link>
      <Link to={`/comptes/edit`}>
        <MenuItem onTouchTap={this.cbks.closeMenu}>
          Ajouter
        </MenuItem>
      </Link>
      <Link to={`/showcase`}>
        <MenuItem onTouchTap={this.cbks.closeMenu}>
          Show case
        </MenuItem>
      </Link>
    </Drawer>;
  }

  render() {
    return (
      <div className="App">
        <AppBar
          title="My Home"
          iconClassNameRight="muidocs-icon-navigation-expand-more"
          onLeftIconButtonTouchTap={this.cbks.openMenu}/>
        {this.renderMenu()}

        {this.props.children}
      </div>
    );
  }
}

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

export default App;
export {
  RouterApp
};
