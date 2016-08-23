import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {RouterApp} from './App';
import './index.css';

const horizons = (function() {
  const horizon = new Horizon({host: '127.0.0.1:8181'}); // eslint-disable-line no-undef

  return {
     messages: horizon('messages'),
     accounts: horizon('accounts'),
     categories: horizon('categories'),
     transactions: horizon('transactions')
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
