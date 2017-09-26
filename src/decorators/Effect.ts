import 'reflect-metadata'
import 'rxjs/add/operator/map'
import { Store } from 'redux'
import { Action as ReduxAction, createAction, ActionFunction0, Reducer as ReduxReducer } from 'redux-actions'
import { Observable } from 'rxjs/Observable'
import { ActionsObservable } from 'redux-observable'

import {
  symbolNamespace,
  symbolDispatch,
  symbolEpics,
  symbolAction,
  symbolNotTrasfer,
  withNamespace,
  withReducer
} from '../symbol'
import { EpicAction } from '../interface'
import { EffectModule } from '../Module'
import { currentReducers, currentSetEffectQueue } from '../shared'

export interface EffectHandler<S> {
  [actionName: string]: ReduxReducer<S, any>
}

export const Effect = (action: string) => {
  return <S, R extends EffectHandler<S>>(handler?: R) =>
    <Target extends EffectModule<S>>(target: Target, method: string, descriptor: PropertyDescriptor) => {
      let startAction: ActionFunction0<ReduxAction<void>>
      let name: string
      const constructor = target.constructor
      const epic: <Input, Output, ActionType extends (keyof R | keyof Target)>(action$: Observable<Input>, store?: Store<S>) =>
        Observable<EpicAction<ActionType, Output>> =
          function (this: EffectModule<S>, action$: ActionsObservable<any>, store?: Store<any>) {
            const matchedAction$ = action$
              .ofType(startAction.toString())
              .map(({ payload }) => payload)
            return descriptor.value.call(this, matchedAction$, store)
              .map((actionResult: ReduxAction<any>) => {
                const { type } = actionResult
                return {
                  ...actionResult,
                  type:  actionResult[symbolNotTrasfer] ? type : withReducer(name, action, type)
                }
              })
          }

      const setup = () => {
        name = Reflect.getMetadata(symbolNamespace, constructor)
        const dispatchs = Reflect.getMetadata(symbolDispatch, constructor)
        const epics = Reflect.getMetadata(symbolEpics, constructor)
        const actionWithNamespace = withNamespace(name, action)
        startAction = createAction(actionWithNamespace)

        if (handler) {
          Object.keys(handler).forEach(key => {
            currentReducers.set(withReducer(name, action, key), handler[key])
          })
        }

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
        value: epic as any
      }
  }
}
