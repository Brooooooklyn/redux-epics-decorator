import { combineEpics } from 'redux-observable'

import { epic as module1Epic } from '../module1'
import { epic as module2Epic } from '../module2'

export default combineEpics(
  module1Epic,
  module2Epic
)
