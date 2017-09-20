import React from 'react'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import { GlobalState } from './store'

import { Module1Container } from './module1'
import { Module2Container } from './module2'

export const AppContainer = (store: Store<GlobalState>) => {
  return class App extends React.PureComponent {
    readonly state = {
      replace: false
    }

    replaceContainer = () => {
      this.setState({
        replace: !this.state.replace
      })
    }

    render() {
      const container = !this.state.replace ? <Module1Container /> : <Module2Container />
      return (
        <Provider store={ store }>
          <div>
            { container }
            <button onClick={ this.replaceContainer }> replace module </button>
          </div>
        </Provider>
      )
    }
  }
}
