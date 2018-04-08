import { Action } from 'redux-actions'
import { Observable } from 'rxjs/Observable'
import { MiddlewareAPI } from 'redux'

import { EffectModule } from './EffectModule'

export type UnpackPayload<T> = T extends Function ?
    T extends (action$: Observable<infer U>) => any ? U :
    T extends () => any ? void :
    T extends (_: any) => any ? void :
    T extends (_: any, action: Action<infer V>) => any ? V : void
  : T extends Observable<infer K> ? K : void

export type ModuleDispatchProps <T extends EffectModule<any>> = {
  [key in Exclude<keyof T, 'defaultState'>]: UnpackPayload<T[key]> extends void ?
    () => Action<void> :
    (payload: UnpackPayload<T[key]>) => Action<UnpackPayload<T[key]>>
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
