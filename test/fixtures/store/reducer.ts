import { combineReducers } from 'redux'

import { reducer as module1, Module1StateProps } from '../module1'
import { reducer as module2, Module2StateProps } from '../module2'

export interface GlobalState {
  module1: Module1StateProps
  module2: Module2StateProps
}

export default combineReducers<GlobalState>({
  module1,
  module2
})
