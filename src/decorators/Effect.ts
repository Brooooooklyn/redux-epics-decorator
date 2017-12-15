import 'reflect-metadata'
import { map } from 'rxjs/operators/map'
import { LOCATION_CHANGE, CALL_HISTORY_METHOD } from 'react-router-redux'
import { Action as ReduxAction, createAction, ActionFunction0 } from 'redux-actions'
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
import { currentSetEffectQueue } from '../shared'

export type ReduxRouterActions = typeof LOCATION_CHANGE | typeof CALL_HISTORY_METHOD

export function Effect () {
  return (target: any, method: string, descriptor: PropertyDescriptor) => {
    let startAction: ActionFunction0<ReduxAction<void>>
    let name: string
    const constructor = target.constructor
    const epic: any =
        function (this: EffectModule<any>, action$: Observable<any>, state$: Observable<any>) {
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
      startAction = createAction(actionWithNamespace)

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
