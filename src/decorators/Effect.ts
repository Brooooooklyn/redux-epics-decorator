import 'reflect-metadata'
import { map } from 'rxjs/operators/map'
import { LOCATION_CHANGE, CALL_HISTORY_METHOD } from 'react-router-redux'
import { Action as ReduxAction, createAction, ActionFunction0, Reducer as ReduxReducer } from 'redux-actions'
import { Observable } from 'rxjs/Observable'
import { ofType } from 'redux-observable'

import {
  symbolNamespace,
  symbolDispatch,
  symbolEpics,
  symbolAction,
  symbolNotTrasfer,
  routerActionNamespace,
  withNamespace,
  withReducer
} from '../symbol'
import { startsWith } from '../startsWith'
import { EffectModule } from '../EffectModule'
import { currentReducers, currentSetEffectQueue } from '../shared'

export interface EffectHandler {
  createActionPayloadCreator?: any
  createActionMetaCreator?: any
  [actionName: string]: ReduxReducer<any, any>
}

export type ReduxRouterActions = typeof LOCATION_CHANGE | typeof CALL_HISTORY_METHOD

export function Effect (handler: EffectHandler = {} as any) {
  return (target: any, method: string, descriptor: PropertyDescriptor) => {
    let startAction: ActionFunction0<ReduxAction<void>>
    let name: string
    const constructor = target.constructor
    const epic: any =
        function (this: EffectModule<any>, action$: Observable<any>, state$: any) {
          const current$ = action$
            .pipe(
              ofType(startAction.toString()),
              map(({ payload }) => payload)
            )
          return descriptor.value.call(this, current$, { state$, action$ })
            .pipe(
              map((actionResult: ReduxAction<any>) => {
                if (Object.prototype.toString.call(actionResult) !== '[object Object]') {
                  const methodPosition = `${ target.constructor.name }#${ method }`
                  throw new TypeError(
                    `${ methodPosition } emit a ${ Object.prototype.toString.call(actionResult, actionResult).replace(/(\[object)|(\])/g, '') }`
                  )
                }
                if (actionResult && !actionResult.type) {
                  return {
                    type: withReducer(name, method, '')
                  }
                }
                return {
                  ...actionResult,
                  type: startsWith(actionResult.type, routerActionNamespace)
                    || actionResult[symbolNotTrasfer]
                    ? actionResult.type
                    : withReducer(name, method, actionResult.type)
                }
              })
            )
        }

    const setup = () => {
      name = Reflect.getMetadata(symbolNamespace, constructor)
      const dispatchs = Reflect.getMetadata(symbolDispatch, constructor)
      const epics = Reflect.getMetadata(symbolEpics, constructor)
      const actionWithNamespace = withNamespace(name, method)
      const { createActionPayloadCreator, createActionMetaCreator, ...reducer } = handler
      startAction = createAction(actionWithNamespace, createActionPayloadCreator, createActionMetaCreator)

      Object.keys(reducer)
        .forEach(key => {
          currentReducers.set(withReducer(name, method, key), handler[key])
        })

      dispatchs[method] = startAction
      epics.push(epic)

      Object.defineProperty(epic, symbolAction, {
        enumerable: false,
        configurable: false,
        value: startAction
      })

    }

    currentSetEffectQueue.push(setup)

    return {
      ...descriptor,
      value: epic
    }
  }
}
