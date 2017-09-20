import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, compose, applyMiddleware, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { createEpicMiddleware } from 'redux-observable'

const rootReducerMap = {
  ui: (s: any) => s
}

const store = createStore(combineReducers(rootReducerMap), compose(
  applyMiddleware(
    createEpicMiddleware(rootEpic)
  )
))

const App = (
  <Provider store={ store }>
    <div />
  </Provider>
)

ReactDOM.render(App, document.querySelector('#app'))
