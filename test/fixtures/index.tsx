import React from 'react'
import { Store } from 'redux'
import { Provider } from 'react-redux'

import { GlobalState } from './store'
import { Module1Container } from './module1'
import { Module2Container } from './module2'
import { Module3Container } from './module3'

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

    props = {} as any

    render() {
      const container = !this.state.replace ? <Module1Container { ...this.props } /> : <Module2Container { ...this.props }/>
      return (
        <Provider store={ store }>
          <div>
            { container }
            <button onClick={ this.replaceContainer }> replace module </button>
            <Module3Container />
          </div>
        </Provider>
      )
    }
  }
}
