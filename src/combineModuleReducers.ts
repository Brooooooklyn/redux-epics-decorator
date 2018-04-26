import { Reducer } from 'redux'

import { EffectModule, Constructorof } from './EffectModule'
import { getReducer } from './decorators/Module'

export const combineModuleReducers = <
  T extends { [index: string]: Constructorof<EffectModule<any>> }
>(
  moduleMap: T,
): { [key in keyof T]: Reducer<any> } => {
  return Object.keys(moduleMap).reduce((acc, key) => {
    acc[key] = getReducer(moduleMap[key])
    return acc
  }, {}) as any
}
