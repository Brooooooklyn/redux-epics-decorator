import 'rxjs/add/observable/never'
import { createAction, Action as ReduxAction } from 'redux-actions'
import { ActionsObservable } from 'redux-observable'
import { Observable } from 'rxjs/Observable'

import { EffectModule } from '../Module'
import { symbolNamespace, symbolEpics, symbolDispatch, withNamespace } from '../symbol'
import { currentSetEffectQueue } from '../shared'

export const DefineAction = <S>(actionName: string) => {
  return (target: EffectModule<S>, propertyName: string) => {
    const constructor = target.constructor

    let action$: ActionsObservable<ReduxAction<any>>
    let actionWithNamespace: string

    const epic = (actions$: ActionsObservable<ReduxAction<any>>) => {
      action$ = actions$.ofType(actionWithNamespace)
      return Observable.never()
    }

    function setup() {
      const name = Reflect.getMetadata(symbolNamespace, constructor)
      const epics = Reflect.getMetadata(symbolEpics, constructor)
      const dispatchs = Reflect.getMetadata(symbolDispatch, constructor)
      actionWithNamespace = withNamespace(name, actionName)
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
