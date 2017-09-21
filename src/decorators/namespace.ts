import { symbolNamespace, symbolDispatch, symbolReducerMap, symbolEpics } from '../symbol'
import { currentReducers, currentSetEffectQueue } from '../shared'

function copyMap(map: Map<any, any>) {
  const dist = new Map()
  map.forEach((val, key) => {
    dist.set(key, val)
  })
  return dist
}

export const namespace = (name: string) =>
(target: any) => {
  Reflect.defineMetadata(symbolNamespace, name, target)
  Reflect.defineMetadata(symbolDispatch, {}, target)
  Reflect.defineMetadata(symbolEpics, [], target)
  currentSetEffectQueue.forEach(setupFn => setupFn())
  Reflect.defineMetadata(symbolReducerMap, copyMap(currentReducers), target)
  currentSetEffectQueue.length = 0
  currentReducers.clear()
}
