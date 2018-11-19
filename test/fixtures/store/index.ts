import { createEpicMiddleware } from 'redux-observable'
import { createStore, compose, applyMiddleware } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import { empty } from 'rxjs'
import { catchError } from 'rxjs/operators'

import rootEpic from './epic'
import rootReducer from './reducer'
import { history } from './history'

const middleware = routerMiddleware(history)

export const setupStore = () => {
  const epicMiddleware = createEpicMiddleware()
  const store = createStore(
    rootReducer,
    compose<any>(
      applyMiddleware(epicMiddleware, middleware),
      window.devToolsExtension ? window.devToolsExtension() : (f: any) => f,
    ),
  )

  epicMiddleware.run((...args: any[]) =>
    rootEpic(...args).pipe(
      catchError((err) => {
        console.error(err)
        return empty()
      }),
    ),
  )
  return store
}

export { GlobalState } from './reducer'
export { history } from './history'
