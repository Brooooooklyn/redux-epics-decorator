import 'reflect-metadata'
import { of as just } from 'rxjs/observable/of'
import { map } from 'rxjs/operators/map'
import { mergeMap } from 'rxjs/operators/mergeMap'
import { Store } from 'redux'
import { LOCATION_CHANGE, CALL_HISTORY_METHOD } from 'react-router-redux'
import {
  Action as ReduxAction,
  createAction,
  ActionFunction0,
  Reducer as ReduxReducer,
} from 'redux-actions'
import { Observable } from 'rxjs/Observable'
import { ofType } from 'redux-observable'

import {
  symbolNamespace,
  symbolDispatch,
  symbolEpics,
  symbolAction,
  symbolNotTrasfer,
  symbolEffectAction,
  symbolEffectActionStream,
  routerActionNamespace,
  withNamespace,
  withReducer,
  forkActionType,
} from '../symbol'
import { startsWith } from '../startsWith'
import { EffectModule } from '../EffectModule'
import { currentReducers, currentSetEffectQueue } from '../shared'

export interface EffectHandler {
  createActionPayloadCreator?: any
  createActionMetaCreator?: any
  [actionName: string]: ReduxReducer<any, any>
}

export type ReduxRouterActions =
  | typeof LOCATION_CHANGE
  | typeof CALL_HISTORY_METHOD

export function Effect(handler: EffectHandler = {} as any) {
  return (target: any, method: string, descriptor: PropertyDescriptor) => {
    let startAction: ActionFunction0<ReduxAction<void>>
    let name: string
    const constructor = target.constructor
    const epic: any = function(
      this: EffectModule<any>,
      action$: Observable<any>,
      store?: Store<any>,
    ) {
      const matchedAction$ = action$[symbolEffectActionStream]
        ? action$
        : action$.pipe(
            ofType(startAction.toString()),
            map(({ payload }) => payload),
          )
      Object.defineProperty(matchedAction$, symbolEffectActionStream, {
        value: true,
      })
      return descriptor.value.call(this, matchedAction$, store).pipe(
        mergeMap((actionResult: ReduxAction<any>) => {
          if (!actionResult) {
            const methodPosition = `${target.constructor.name}#${method}`
            throw new TypeError(
              `${methodPosition} emit a ${Object.prototype.toString
                .call(actionResult, actionResult)
                .replace(/(\[object)|(\])/g, '')}`,
            )
          }
          const { type } = actionResult
          if (!type) {
            console.warn(
              `result from ${
                target.constructor.name
              }#${method} epic is not a action: `,
              actionResult,
            )
          }
          const isActionFromEffect = actionResult[symbolEffectAction]
          const isActionNotTransfer = actionResult[symbolNotTrasfer]
          const trasnferedAction = {
            ...actionResult,
            type:
              isActionNotTransfer ||
              startsWith(actionResult.type, routerActionNamespace)
                ? type
                : isActionFromEffect
                  ? forkActionType(name, method, type)
                  : withReducer(name, method, type),
          }
          Object.defineProperty(trasnferedAction, symbolEffectAction, {
            value: true,
          })
          if (isActionNotTransfer) {
            Object.defineProperty(trasnferedAction, symbolNotTrasfer, {
              value: true,
            })
          }
          const actions = [trasnferedAction]
          if (isActionFromEffect && !isActionNotTransfer) {
            actions.unshift(actionResult)
          }
          return just(...actions)
        }),
      )
    }

    const setup = () => {
      name = Reflect.getMetadata(symbolNamespace, constructor)
      const dispatchs = Reflect.getMetadata(symbolDispatch, constructor)
      const epics = Reflect.getMetadata(symbolEpics, constructor)
      const actionWithNamespace = withNamespace(name, method)
      const {
        createActionPayloadCreator,
        createActionMetaCreator,
        ...reducer
      } = handler
      startAction = createAction(
        actionWithNamespace,
        createActionPayloadCreator,
        createActionMetaCreator,
      )

      Object.keys(reducer).forEach((key) => {
        currentReducers.set(withReducer(name, method, key), handler[key])
      })

      dispatchs[method] = startAction
      epics.push(epic)

      Object.defineProperty(epic, symbolAction, {
        enumerable: false,
        configurable: false,
        value: startAction,
      })
    }

    currentSetEffectQueue.push(setup)

    return {
      ...descriptor,
      value: epic,
    }
  }
}
