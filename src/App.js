import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Layout, Menu, Breadcrumb } from 'antd';

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

const { Header, Footer, Sider, Content } = Layout;

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
    return (
      <Menu
      theme="dark"
      mode="horizontal"
      defaultSelectedKeys={[menuLinks[0].label]}
      style={{ lineHeight: '64px' }}>
        {menuLinks.map(link => (
          <Menu.Item key={link.label} onClick={() => this.props.linkTo(link.target)}>
            {link.label}
          </Menu.Item>
        ))}
      </Menu>
    );
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
      <Layout className="layout">
        <Header>
          {this.renderMenu()}
        </Header>
        <Content style={{ padding: '0 50px' }}>
          {this.props.children}
        </Content>
      </Layout>
    );
  }
}

const getView = (viewId) => {
  switch (viewId) {
    case 'accounts': return AccountActivity;
    case 'transactions': return TransactionActivity;
    case 'templates': return TemplateActivity;
    case 'export': return AccountExportActivity;
    default: return Showcase;
  }
};

const RouterApp = (props) => {
  const View = getView(props.view.id);
  return <App view={props.view} linkTo={props.linkTo}>
    <View
        context={props.view.context}
        state={props.view.state} />
  </App>;
};
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
