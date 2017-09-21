import React from 'react'
import ReactDOM from 'react-dom'

import { AppContainer } from './fixtures'
import { setupStore } from './fixtures/store'

const App = AppContainer(setupStore())

ReactDOM.render(<App />, document.querySelector('#app'))
