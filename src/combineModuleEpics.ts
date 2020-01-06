import { combineEpics } from 'redux-observable'
import { rootInjectableFactory } from '@asuka/di'

import { Constructorof, EffectModule } from './EffectModule'
import { getEpic } from './decorators/Module'

export const combineModuleEpics = (
  ...args: Constructorof<EffectModule<any>>[]
) => {
  rootInjectableFactory.resolveProviders()
  return combineEpics(...args.map((module) => getEpic(module)))
}
