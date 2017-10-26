import { createEpicMiddleware } from 'redux-observable'
import { createStore, compose, applyMiddleware } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createMemoryHistory'

import rootEpic from './epic'
import rootReducer, { GlobalState } from './reducer'

export const history = createHistory()
const middleware = routerMiddleware(history)

export const setupStore = () => createStore<GlobalState>(rootReducer, compose<any>(
  applyMiddleware(
    createEpicMiddleware(rootEpic),
    middleware
  ),
  window.devToolsExtension ? window.devToolsExtension() : (f: any) => f
))

export { GlobalState } from './reducer'
