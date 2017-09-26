import { Action } from 'redux-actions'
import { Observable } from 'rxjs/Observable'
import { MiddlewareAPI } from 'redux'

import { EffectModule } from './Module'

export type ModuleActionProps <S, T extends EffectModule<S>> = {
  [key in keyof T]: (...args: any[]) => Action<any>
}

export type EpicLike<T, U, S, D = any> =
  (action$: Observable<T>, store: MiddlewareAPI<S>, dependencies: D) => Observable<EpicAction<string, U>>

export interface EpicAction<ActionType extends string, PayloadType> {
  type: ActionType
  payload?: PayloadType
  error?: boolean
}
