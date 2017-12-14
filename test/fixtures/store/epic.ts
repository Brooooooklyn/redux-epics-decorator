import { combineEpics } from 'redux-observable'

import Module2 from '../module2'
import { epic as module3Epic } from '../module3'
import Module1 from '../module1'
import Module4 from '../module4'
import DepModule4 from '../module4/depModule'

import { combineModuleEpics } from '../../../src'

export default combineEpics(
  combineModuleEpics(
    Module1,
    Module2,
    Module4,
    DepModule4,
  ),
  module3Epic,
)
