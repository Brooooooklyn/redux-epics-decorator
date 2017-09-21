import { createEpicMiddleware } from 'redux-observable'
import { createStore, compose, applyMiddleware } from 'redux'

import rootEpic from './epic'
import rootReducer, { GlobalState } from './reducer'

export const setupStore = () => createStore<GlobalState>(rootReducer, compose<any>(
  applyMiddleware(
    createEpicMiddleware(rootEpic)
  ),
  window.devToolsExtension ? window.devToolsExtension() : (f: any) => f
))

export { GlobalState } from './reducer'
