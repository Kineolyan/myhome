import React, { Component } from 'react';
import {connect} from 'react-redux';
import './App.css';

import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

import TransactionActivity from './activities/TransactionActivity';
import AccountActivity from './activities/AccountActivity';
import AccountExportActivity from './activities/AccountExportActivity';
import TemplateActivity from './activities/TemplateActivity';
import Showcase from './general/Showcase';

const menuLinks = [
  {target: `#/comptes`, label: 'Comptes'},
  {target: `#/comptes/edit`, label: 'Ajouter'},
  {target: '#/comptes/templates', label: 'Templates'},
  {target: `#/comptes/export`, label: 'Export'},
  {target: `#/showcase`, label: 'Showcase'}
];
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
      {menuLinks.map(link => <a href={link.target} key={link.target}>
        <MenuItem onTouchTap={this.cbks.closeMenu}>
          {link.label}
        </MenuItem>
      </a>)}
    </Drawer>;
  }

  renderTitle(viewName) {
    if (!viewName) {
      return 'My Home'
    } else {
      switch(viewName) {
        case 'accounts': return 'My Home | Accounts';
        case 'transactions': return 'My Home | Transactions';
        case 'templates': return 'My Home | Templates';
        case 'export': return 'My Home | Account Export';
        default: return `My Home | [${viewName}]`;
      }
    }
  }

  render() {
    return (
      <div className="App">
        <AppBar
          title={this.renderTitle(this.props.view)}
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
      case 'templates': return <TemplateActivity />;
      case 'export': return <AccountExportActivity />;
      default: return <Showcase />;
    }
  }

  render() {
    return <App view={this.props.view}>
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
