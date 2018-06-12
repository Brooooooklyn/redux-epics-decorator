import { createEpicMiddleware } from 'redux-observable'
import { createStore, compose, applyMiddleware } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createMemoryHistory'
import { empty } from 'rxjs'
import { catchError } from 'rxjs/operators'

import rootEpic from './epic'
import rootReducer from './reducer'

export const history = createHistory()
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
