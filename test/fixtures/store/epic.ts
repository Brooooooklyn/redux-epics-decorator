import { combineEpics } from 'redux-observable'

import Module2 from '../module2'
import { epic as module3Epic } from '../module3'
import Module1 from '../module1'
import Module4 from '../module4'

import { getEpic } from '../../../src/decorators'

const module1Epic = getEpic(Module1)
const module2Epic = getEpic(Module2)
const module4Epic = getEpic(Module4)

export default combineEpics(
  module1Epic,
  module2Epic,
  module3Epic,
  module4Epic
)
