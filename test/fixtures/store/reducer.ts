import { combineReducers } from 'redux'
import { RouterState, routerReducer } from 'react-router-redux'

import { getReducer } from '../../../src/decorators'
import { reducer as module3, Module3StateProps } from '../module3'
import Module1, { Module1StateProps } from '../module1'
import Module2, { Module2StateProps } from '../module2'
import Module4, { Module4StateProps } from '../module4'

export interface GlobalState {
  module1: Module1StateProps
  module2: Module2StateProps
  module3: Module3StateProps
  module4: Module4StateProps
  router: RouterState
}

const module1 = getReducer(Module1)
const module2 = getReducer(Module2)
const module4 = getReducer(Module4)

export default combineReducers<GlobalState>({
  module1,
  module2,
  module3,
  module4,
  router: routerReducer
})
