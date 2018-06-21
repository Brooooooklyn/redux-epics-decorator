import { createAction, Action as ReduxAction } from 'redux-actions'
import { Observable, Subject, EMPTY } from 'rxjs'
import { mergeMap, tap } from 'rxjs/operators'
import { ActionsObservable, ofType } from 'redux-observable'

import { EffectModule } from '../EffectModule'
import {
  symbolNamespace,
  symbolEpics,
  symbolDispatch,
  withNamespace,
} from '../symbol'
import { currentSetEffectQueue } from '../shared'
import { ReducerHandler } from '../interface'

export function DefineAction<S>(reducerHandler: ReducerHandler = {}): any {
  return (target: EffectModule<S>, propertyName: string) => {
    const constructor = target.constructor
    const {
      createActionPayloadCreator,
      createActionMetaCreator,
    } = reducerHandler
    let action$: Observable<ReduxAction<any>>
    let actionWithNamespace: string

    const epic = (actions$: ActionsObservable<ReduxAction<any>>) => {
      const actionSubject$ = new Subject<ReduxAction<any>>()
      action$ = new ActionsObservable(actionSubject$)
      return actions$.pipe(
        ofType(actionWithNamespace),
        tap(actionSubject$),
        mergeMap(() => EMPTY),
      )
    }

    function setup() {
      const name = Reflect.getMetadata(symbolNamespace, constructor)
      const epics = Reflect.getMetadata(symbolEpics, constructor)
      const dispatchs = Reflect.getMetadata(symbolDispatch, constructor)
      actionWithNamespace = withNamespace(name, propertyName)
      const startAction = createAction(
        actionWithNamespace,
        createActionPayloadCreator,
        createActionMetaCreator,
      )
      dispatchs[propertyName] = startAction
      Object.defineProperty(target, propertyName, {
        get() {
          return action$
        },
      })

      epics.push(epic)
    }

    currentSetEffectQueue.push(setup)
  }
}
