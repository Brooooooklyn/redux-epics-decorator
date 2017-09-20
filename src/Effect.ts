import 'reflect-metadata'
import 'rxjs/add/operator/finally'
import 'rxjs/add/operator/merge'
import 'rxjs/add/operator/take'
import 'rxjs/add/operator/map'
import { Store } from 'redux'
import { Action, createAction, ActionFunction0, Reducer } from 'redux-actions'
import { ActionsObservable } from 'redux-observable'

import { EffectModule } from './Module'

export interface EffectHandler<S, T> {
  [actionName: string]: Reducer<S, T>
}

export const symbolNamespace = Symbol('namespace')
export const symbolDispatch = Symbol('dispatch')
export const symbolReducerMap = Symbol('reducerMap')
export const symbolEpics = Symbol('symbolActionQueue')

let currentReducers = { }
const currentSetEffectQueue: ((...args: any[]) => any)[] = []

export const namespace = (name: string) =>
  (target: any) => {
    Reflect.defineMetadata(symbolNamespace, name, target)
    Reflect.defineMetadata(symbolDispatch, {}, target)
    Reflect.defineMetadata(symbolReducerMap, currentReducers, target)
    Reflect.defineMetadata(symbolEpics, [], target)
    currentSetEffectQueue.forEach(setupFn => setupFn())
    currentSetEffectQueue.length = 0
    currentReducers = { }
  }

export const Effect = <S, T, R extends EffectHandler<S, T>>(action: string) => {
  return (handler: R) =>
    (target: EffectModule<S>, method: string, descriptor: PropertyDescriptor) => {
      let startAction: ActionFunction0<Action<void>>
      let name: string
      const constructor = target.constructor

      const epic = function(this: EffectModule<S>, action$: ActionsObservable<Action<any>>, store?: Store<any>) {
        const matchedAction$ = action$
          .ofType(startAction.toString())
          .map(({ payload }) => payload)
        return descriptor.value.call(this, matchedAction$, store)
          .map((actionResult: Action<any>) => {
            return {
              ...actionResult,
              type: `${ name }/${ action }_${ actionResult.type }`
            }
          })
      }

      const setup = () => {
        name = Reflect.getMetadata(symbolNamespace, constructor)
        const dispatchs = Reflect.getMetadata(symbolDispatch, constructor)
        const epics = Reflect.getMetadata(symbolEpics, constructor)
        if (!name || !dispatchs) {
          const moduleName = constructor.name
          throw new TypeError(`Fail to decorate ${ moduleName }.${ method }, Class ${ moduleName } must have namespace metadata`)
        }
        const actionWithNamespace = `${ name }/${ action }`
        startAction = createAction(actionWithNamespace)
        Object.keys(handler).forEach(key => {
          currentReducers[`${ actionWithNamespace }_${ key }`] = handler[key]
        })
        dispatchs[method] = startAction
        epics.push(epic)
      }

      currentSetEffectQueue.push(setup)

      return {
        ...descriptor,
        value: epic
      }
  }
}
