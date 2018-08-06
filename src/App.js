import React, { Component } from 'react';
import {connect} from 'react-redux';
import './App.css';

import actions from './redux/actions';

import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

import TransactionActivity from './activities/TransactionActivity';
import AccountActivity from './activities/AccountActivity';
import AccountExportActivity from './activities/AccountExportActivity';
import TemplateActivity from './activities/TemplateActivity';
import Showcase from './general/Showcase';

const menuLinks = [
  {label: 'Comptes', target: {entity: 'comptes'}},
  {label: 'Ajouter', target: {entity: 'comptes', section: 'edit'}},
  {label: 'Templates', target: {entity: 'templates'}},
  {label: 'Export', target: {entity: 'comptes', section: 'export'}},
  {label: 'Showcase', target: {entity: 'showcase'}}
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
      {menuLinks.map(link => <div 
          onClick={() => this.props.linkTo(link.target)} 
          key={link.label}>
        <MenuItem onTouchTap={this.cbks.closeMenu}>
          {link.label}
        </MenuItem>
      </div>)}
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
          title={this.renderTitle(this.props.view.id)}
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
    switch(this.props.view.id) {
      case 'accounts': return <AccountActivity />;
      case 'transactions': return <TransactionActivity/>;
      case 'templates': return <TemplateActivity context={this.props.view.context}/>;
      case 'export': return <AccountExportActivity />;
      default: return <Showcase />;
    }
  }

  render() {
    return <App view={this.props.view} linkTo={this.props.linkTo}>
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
const mapDispatchToProps = (dispatch, props) => {
  return {
    linkTo: (context) => dispatch({
      type: actions.location.goto,
      context
    })
  }
}
const ReduxApp = connect(mapStateToProps, mapDispatchToProps)(RouterApp);

export default ReduxApp;
