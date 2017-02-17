import Rx from 'rxjs';

function createCycleMiddleware () {
  let store = null
  let actionSubject = new Rx.Subject();
  let stateSubject = new Rx.Subject();

  const cycleMiddleware = _store => {
    store = _store
    return next => {
      return action => {
        let result = next(action);
				actionSubject.onNext(action);
				stateSubject.onNext(store.getState());

        return result;
      }
    }
  }

  cycleMiddleware.makeActionDriver = () => {
    return function actionDriver(outgoing$) {
      outgoing$.subscribe(
        outgoing => {
          if (store) {
            store.dispatch(outgoing);
          }
        },
        err => {
					console.error('Action error', err);
				}
      );

      return actionSubject;
    }
  }

  cycleMiddleware.makeStateDriver = () => {
    const isSame = {}
    return function stateDriver() {
      const getCurrent = store.getState;
      return stateSubject
				.reduce((prevState, currState) => {
					if (prevState === getCurrent) {
						prevState = getCurrent()
					}
					if (prevState === currState) {
						return isSame
					}
					return currState
				}, getCurrent)
				.map(state => state === getCurrent ? getCurrent() : state)
				.filter(state => state !== isSame);
    }
  }

  return cycleMiddleware
};

export {
	createCycleMiddleware
};
