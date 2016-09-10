import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {RouterApp} from './App';
import './index.css';
const {MyHome} = window;

const horizons = (function() {
  const horizon = new Horizon({host: `${MyHome.horizon.url}:${MyHome.horizon.port}`}); // eslint-disable-line no-undef

  return {
     messages: horizon('messages'),
     accounts: horizon('accounts'),
     categories: horizon('categories'),
     transactions: horizon('transactions'),
     validations: horizon('account_validations')
   };
})();

class MuiApp extends React.Component {
  getChildContext() {
    return {horizons};
  }

  render() {
    return (
      <MuiThemeProvider>
        <RouterApp />
      </MuiThemeProvider>
    );
  }
}

MuiApp.childContextTypes = {
  horizons: React.PropTypes.shape({
    messages: React.PropTypes.object,
    accounts: React.PropTypes.object
  })
};

ReactDOM.render(
  <MuiApp />,
  document.getElementById('root')
);
