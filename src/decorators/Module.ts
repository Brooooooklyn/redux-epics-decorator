import { ReflectiveInjector, Injectable, Injector, Provider  } from 'injection-js'

import { symbolNamespace, symbolDispatch, symbolReducerMap, symbolEpics } from '../symbol'
import { currentReducers, currentSetEffectQueue } from '../shared'
import { Constructorof } from '../EffectModule'

function copyMap(map: Map<any, any>) {
  const dist = new Map()
  map.forEach((val, key) => {
    dist.set(key, val)
  })
  return dist
}

export const allDeps = new Set()

export interface ModuleConfig {
  name: string
  providers?: Provider[]
}

export const Module = (moduleConfig: string | ModuleConfig) =>
(target: any) => {
  Reflect.defineMetadata(symbolNamespace, typeof moduleConfig === 'string' ? moduleConfig : moduleConfig.name, target)
  Reflect.defineMetadata(symbolDispatch, {}, target)
  Reflect.defineMetadata(symbolEpics, [], target)
  currentSetEffectQueue.forEach(setupFn => setupFn())
  Reflect.defineMetadata(symbolReducerMap, copyMap(currentReducers), target)
  currentSetEffectQueue.length = 0
  currentReducers.clear()

  allDeps.add(target)

  if (typeof moduleConfig === 'object' && moduleConfig.providers) {
    if (!Array.isArray(moduleConfig.providers)) {
      throw new TypeError('expect type of providers to be array')
    }
    if (moduleConfig.providers.length) {
      moduleConfig.providers.forEach(provider => {
        allDeps.add(provider)
      })
    }
  }
  return Injectable()(target)
}

let lastDepsSize = 0
let injector: Injector
export const getInstance = <T = any>(ins: Constructorof<T>): T => {
  // 动态注入
  if (lastDepsSize !== allDeps.size) {
    injector = ReflectiveInjector.resolveAndCreate(Array.from((allDeps as any)))
    lastDepsSize = allDeps.size
  }
  return injector.get(ins)
}

export const getReducer = (ins: any) => {
  return getInstance(ins).reducer
}

export const getEpic = (ins: any) => {
  return getInstance(ins).epic
}
