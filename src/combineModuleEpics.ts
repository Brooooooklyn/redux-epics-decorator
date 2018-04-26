import { combineEpics } from 'redux-observable'

import { Constructorof, EffectModule } from './EffectModule'
import { getEpic } from './decorators/Module'

export const combineModuleEpics = (
  ...args: Constructorof<EffectModule<any>>[]
) => {
  return combineEpics(...args.map((module) => getEpic(module)))
}
