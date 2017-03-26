import React, { Component } from 'react';
import {connect} from 'react-redux';
import './App.css';

import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

import TransactionActivity from './activities/TransactionActivity';
import AccountActivity from './activities/AccountActivity';
import Showcase from './general/Showcase';

import ReduxTransactions from './transactions/ReduxTransactions';

import Counter from './redux/counter';


import ReduxTransactions from './transactions/ReduxTransactions';

import Counter from './redux/counter';

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
      <a href={`#/comptes`}>
        <MenuItem onTouchTap={this.cbks.closeMenu}>
          Comptes
        </MenuItem>
      </a>
      <a href={`#/comptes/edit`}>
        <MenuItem onTouchTap={this.cbks.closeMenu}>
          Ajouter
        </MenuItem>
      </a>
      <a href={`#/showcase`}>
        <MenuItem onTouchTap={this.cbks.closeMenu}>
          Show case
        </MenuItem>
      </a>
      <Counter/>
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
  renderView() {
    switch(this.props.view) {
      case 'accounts': return <AccountActivity />;
      case 'transactions': return <TransactionActivity/>;
      default: return <Showcase />;
    }
  }

  render() {
    return <App>
      {this.renderView()}
    </App>;
  }
}

const mapStateToProps = (state, props) => {
	return {
		...props,
		view: state.view
	};
};
const ReduxApp = connect(mapStateToProps, () => ({}))(RouterApp);

export default ReduxApp;
