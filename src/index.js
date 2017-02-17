import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

import {createStore, applyMiddleware, compose} from 'redux';
import {Provider} from 'react-redux';
// Cannot use redux-cycles as it supports only xstream
import {createCycleMiddleware} from './redux/middleware'; // redux-cycles';
import Cycle from '@cycle/rxjs-run';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import main from './redux/cycle';
import accountApp from './redux/store';
import {RouterApp} from './App';
import {defineHorizons, HorizonsShape} from './core/horizon';
import './index.css';
const {MyHome} = window;

const horizons = (function() {
  const horizon = new Horizon({host: `${MyHome.horizon.url}:${MyHome.horizon.port}`}); // eslint-disable-line no-undef

  return defineHorizons(horizon);
})();

const cycleMiddleware = createCycleMiddleware();
const { makeActionDriver, makeStateDriver } = cycleMiddleware;

const store = createStore(
  accountApp,
  compose(
    applyMiddleware(
      cycleMiddleware
      // May add the middleware react-router-redux
    )
  )
);

class MuiApp extends React.Component {
  getChildContext() {
    return {horizons};
  }

  render() {
    return (
      <MuiThemeProvider>
        <Provider store={store}>
          <RouterApp />
        </Provider>
      </MuiThemeProvider>
    );
  }
}

MuiApp.childContextTypes = {
  horizons: HorizonsShape
};

Cycle.run(main, {
  ACTION: makeActionDriver(),
  STATE: makeStateDriver()
});


ReactDOM.render(
  <MuiApp />,
  document.getElementById('root')
);
