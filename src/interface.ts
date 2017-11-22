import { Action } from 'redux-actions'
import { Observable } from 'rxjs/Observable'
import { MiddlewareAPI } from 'redux'

import { EffectModule } from './EffectModule'

export type ModuleActionProps <S, T extends EffectModule<S>> = {
  [key in keyof T]: (...args: any[]) => Action<any>
}

export interface EpicLike<Input, Output, S, ActionType extends string> {
  (action$: Observable<Input>, store?: MiddlewareAPI<S>, dependencies?: any): Observable<EpicAction<ActionType, Output>>
}

export interface EpicAction<ActionType extends string, PayloadType> {
  type: ActionType
  payload: PayloadType
}

export interface ReducerHandler {
  createActionPayloadCreator?: any
  createActionMetaCreator?: any
}
