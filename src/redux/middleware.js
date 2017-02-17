import Rx from 'rxjs';

function createCycleMiddleware () {
  let store = null
  let actionListener = null
  let stateListener = null

  const cycleMiddleware = _store => {
    store = _store
    return next => {
      return action => {
        let result = next(action)
        if (actionListener) {
          actionListener.next(action)
        }
        if (stateListener) {
          stateListener.next(store.getState())
        }
        return result
      }
    }
  }

  cycleMiddleware.makeActionDriver = () => {
    return function actionDriver(outgoing$) {
      outgoing$.subscribe({
        next: outgoing => {
          if (store) {
            store.dispatch(outgoing)
          }
        },
        error: () => {},
        complete: () => {},
      })

      return Rx.Observable.create(subscriber => {
				actionListener = subscriber;
        return () => {
					actionListener = null;
				};
      })
    }
  }

  cycleMiddleware.makeStateDriver = () => {
    const isSame = {}
    return function stateDriver() {
      const getCurrent = store.getState
      return Rx.Observable.create(subscriber => {
				stateListener = subscriber;
        return () => {
					stateListener = null;
				};
      })
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
      .filter(state => state !== isSame)
    }
  }

  return cycleMiddleware
};

export {
	createCycleMiddleware
};
