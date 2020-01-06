import { Injectable, Provider, rootInjectableFactory } from '@asuka/di'

import {
  symbolNamespace,
  symbolDispatch,
  symbolReducerMap,
  symbolEpics,
} from '../symbol'
import { currentReducers, currentSetEffectQueue } from '../shared'

function copyMap(map: Map<any, any>) {
  const dist = new Map()
  map.forEach((val, key) => {
    dist.set(key, val)
  })
  return dist
}

export interface ModuleConfig {
  name: string
  providers?: Provider[]
}

export const Module = (moduleConfig: string | ModuleConfig) => (
  target: any,
) => {
  Reflect.defineMetadata(
    symbolNamespace,
    typeof moduleConfig === 'string' ? moduleConfig : moduleConfig.name,
    target,
  )
  Reflect.defineMetadata(symbolDispatch, {}, target)
  Reflect.defineMetadata(symbolEpics, [], target)
  currentSetEffectQueue.forEach((setupFn) => setupFn())
  Reflect.defineMetadata(symbolReducerMap, copyMap(currentReducers), target)
  currentSetEffectQueue.length = 0
  currentReducers.clear()

  if (typeof moduleConfig === 'object' && moduleConfig.providers) {
    if (!Array.isArray(moduleConfig.providers)) {
      throw new TypeError('expect type of providers to be array')
    }
    return Injectable({ providers: moduleConfig.providers })(target)
  }
  return Injectable()(target)
}

export const getReducer = (ins: any) => {
  return rootInjectableFactory.getInstance<any>(ins).reducer
}

export const getEpic = (ins: any) => {
  return rootInjectableFactory.getInstance<any>(ins).epic
}
