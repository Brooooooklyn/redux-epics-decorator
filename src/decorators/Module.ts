import { symbolNamespace, symbolDispatch, symbolReducerMap, symbolEpics } from '../symbol'
import { ReflectiveInjector, Injectable, Injector  } from 'injection-js'
import { currentReducers, currentSetEffectQueue } from '../shared'

function copyMap(map: Map<any, any>) {
  const dist = new Map()
  map.forEach((val, key) => {
    dist.set(key, val)
  })
  return dist
}

export const allDeps = new Set()

export const Module = (name: string) =>
(target: any) => {
  Reflect.defineMetadata(symbolNamespace, name, target)
  Reflect.defineMetadata(symbolDispatch, {}, target)
  Reflect.defineMetadata(symbolEpics, [], target)
  currentSetEffectQueue.forEach(setupFn => setupFn())
  Reflect.defineMetadata(symbolReducerMap, copyMap(currentReducers), target)
  currentSetEffectQueue.length = 0
  currentReducers.clear()

  allDeps.add(target)
  return Injectable()(target)
}

let lastDepsSize = 0
let injector: Injector
export const getInstance = (ins: any) => {
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
