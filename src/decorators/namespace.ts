import { symbolNamespace, symbolDispatch, symbolReducerMap, symbolEpics } from '../symbol'
import { currentReducers, currentSetEffectQueue } from '../shared'

export const namespace = (name: string) =>
(target: any) => {
  Reflect.defineMetadata(symbolNamespace, name, target)
  Reflect.defineMetadata(symbolDispatch, {}, target)
  Reflect.defineMetadata(symbolReducerMap, currentReducers, target)
  Reflect.defineMetadata(symbolEpics, [], target)
  currentSetEffectQueue.forEach(setupFn => setupFn())
  currentSetEffectQueue.length = 0
  currentReducers.clear()
}
