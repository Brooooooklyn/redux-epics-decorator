import { rootInjectableFactory } from '@asuka/di'
import { EffectModule, Constructorof } from './EffectModule'
import { getReducer } from './decorators/Module'

export const combineModuleReducers = <
  T extends { [index: string]: Constructorof<EffectModule<any>> }
>(
  moduleMap: T,
): any => {
  rootInjectableFactory.resolveProviders()
  return Object.keys(moduleMap).reduce((acc, key) => {
    acc[key] = getReducer(moduleMap[key])
    return acc
  }, {}) as any
}
