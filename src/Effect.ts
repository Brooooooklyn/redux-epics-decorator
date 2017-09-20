import 'reflect-metadata'
import 'rxjs/add/observable/never'
import 'rxjs/add/operator/finally'
import 'rxjs/add/operator/merge'
import 'rxjs/add/operator/take'
import 'rxjs/add/operator/map'
import { Store } from 'redux'
import { Observable } from 'rxjs/Observable'
import { Action as ReduxAction, createAction, ActionFunction0, Reducer as ReduxReducer } from 'redux-actions'
import { ActionsObservable } from 'redux-observable'

import { EffectModule } from './Module'

export interface EffectHandler<S, T> {
  [actionName: string]: ReduxReducer<S, T>
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
      let startAction: ActionFunction0<ReduxAction<void>>
      let name: string
      const constructor = target.constructor

      function epic(this: EffectModule<S>, action$: ActionsObservable<ReduxAction<any>>, store?: Store<any>) {
        const matchedAction$ = action$
          .ofType(startAction.toString())
          .map(({ payload }) => payload)
        return descriptor.value.call(this, matchedAction$, store)
          .map((actionResult: ReduxAction<any>) => {
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

export const Reducer = <S>(actionName: string) => {
  return (target: EffectModule<S>, method: string, descriptor: PropertyDescriptor) => {

    const reducer = descriptor.value
    const constructor = target.constructor

    function setup() {
      const name = Reflect.getMetadata(symbolNamespace, constructor)
      if (!name) {
        const moduleName = constructor.name
        throw new TypeError(`Fail to decorate ${ moduleName }.${ method }, Class ${ moduleName } must have namespace metadata`)
      }
      const dispatchs = Reflect.getMetadata(symbolDispatch, constructor)
      const actionWithNamespace = `${ name }/${ actionName }`
      const startAction = createAction(actionWithNamespace)
      currentReducers[actionWithNamespace] = reducer
      dispatchs[method] = startAction
    }

    currentSetEffectQueue.push(setup)

    return {
      ...descriptor,
      value: reducer
    }
  }
}

export const DefineAction = <S>(actionName: string) => {
  return (target: EffectModule<S>, propertyName: string) => {
    const constructor = target.constructor

    let action$: ActionsObservable<ReduxAction<any>>
    let actionWithNamespace: string

    const epic = (actions$: ActionsObservable<ReduxAction<any>>) => {
      action$ = actions$.ofType(actionWithNamespace)
      console.info(action$)
      return Observable.never()
    }

    function setup() {
      const name = Reflect.getMetadata(symbolNamespace, constructor)
      const epics = Reflect.getMetadata(symbolEpics, constructor)
      if (!name) {
        const moduleName = constructor.name
        throw new TypeError(`Fail to decorate ${ moduleName }.${ propertyName }, Class ${ moduleName } must have namespace metadata`)
      }
      const dispatchs = Reflect.getMetadata(symbolDispatch, constructor)
      actionWithNamespace = `${ name }/${ actionName }`
      const startAction = createAction(actionWithNamespace)
      dispatchs[propertyName] = startAction
      Object.defineProperty(target, propertyName, {
        get() {
          return action$
        }
      })

      epics.push(epic)
    }

    currentSetEffectQueue.push(setup)
  }
}
