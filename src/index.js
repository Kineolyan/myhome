import React from 'react';
import ReactDOM from 'react-dom';

import {createStore, applyMiddleware, compose} from 'redux';
import {Provider} from 'react-redux';
// Cannot use redux-cycles as it supports only xstream
import {createCycleMiddleware} from 'redux-cycles';
// import {createCycleMiddleware} from './redux/middleware';
import Cycle from '@cycle/xstream-run';
// import Cycle from '@cycle/rxjs-run';

import main from './cycle/main';
import accountApp from './redux/store';
import {createLogDriver} from './cycle/LogDriver';
import {makeHorizonDriver} from './cycle/HorizonDriver';
import {makeRouterDriver} from './cycle/RouterDriver';
import App from './App';
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
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}

MuiApp.childContextTypes = {
  horizons: HorizonsShape
};

Cycle.run(main, {
  ACTION: makeActionDriver(),
  STATE: makeStateDriver(),
  HORIZONS: makeHorizonDriver(horizons),
  LOG: createLogDriver(true),
  ROUTER: makeRouterDriver()
});


ReactDOM.render(
  <MuiApp />,
  document.getElementById('root')
);
