import { Action } from 'redux-actions'
import { Observable } from 'rxjs'
import { MiddlewareAPI, Dispatch } from 'redux'

import { EffectModule } from './EffectModule'

export type UnpackPayload<T> = T extends Function
  ? T extends () => any
    ? void
    : T extends (action$: infer U) => any
    ? U extends Observable<infer P>
      ? P
      : void
    : T extends (action$: infer U, action: infer V) => any
    ? U extends Observable<infer P>
      ? P
      : V extends Action<infer Payload>
      ? Payload
      : void
    : void
  : T extends Observable<infer K>
  ? K
  : void

export type ModuleDispatchProps<T extends EffectModule<any>> = {
  [key in keyof T]: UnpackPayload<T[key]> extends void
    ? () => Action<void>
    : (payload: UnpackPayload<T[key]>) => Action<UnpackPayload<T[key]>>
} & {
  defaultState: never
}

export interface EpicLike<Input, Output, S, ActionType extends string> {
  (
    action$: Observable<Input>,
    store?: MiddlewareAPI<Dispatch, S>,
    dependencies?: any,
  ): Observable<EpicAction<ActionType, Output>>
}

export interface EpicAction<ActionType extends string, PayloadType> {
  type: ActionType
  payload: PayloadType
}

export interface ReducerHandler {
  createActionPayloadCreator?: any
  createActionMetaCreator?: any
}
