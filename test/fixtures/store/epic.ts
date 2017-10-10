import { combineEpics } from 'redux-observable'

import { epic as module1Epic } from '../module1'
import { epic as module2Epic } from '../module2'
import { epic as module3Epic } from '../module3'

export default combineEpics(
  module1Epic,
  module2Epic,
  module3Epic,
)
