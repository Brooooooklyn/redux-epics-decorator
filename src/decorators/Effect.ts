import 'reflect-metadata'
import 'rxjs/add/operator/map'
import { Store } from 'redux'
import { Action as ReduxAction, createAction, ActionFunction0, Reducer as ReduxReducer } from 'redux-actions'
import { ActionsObservable } from 'redux-observable'

import { symbolNamespace, symbolDispatch, symbolEpics, symbolAction, symbolNotTrasfer } from '../symbol'
import { EffectModule } from '../Module'
import { currentReducers, currentSetEffectQueue } from '../shared'

export interface EffectHandler<S, T> {
  [actionName: string]: ReduxReducer<S, T>
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
            const { type } = actionResult
            return {
              ...actionResult,
              type:  actionResult[symbolNotTrasfer] ? type : `${ name }/${ action }_${ type }`
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
          currentReducers.set(`${ actionWithNamespace }_${ key }`, handler[key])
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
