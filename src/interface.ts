import { Action } from 'redux-actions'
import { Observable } from 'rxjs/Observable'
import { MiddlewareAPI } from 'redux'

import { EffectModule } from './EffectModule'

// https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-311923766 would break defination lookup
// just a workaround to avoid `props.reducer()`
// need refactor
export type ModuleActionProps <S, T extends EffectModule<S>> = {
  [key in keyof T]: (...args: any[]) => Action<any>
} & {
  reducer: never
  epic: never
  defaultState: never
}

export type EpicLike<Input, Output, S, D = any> =
  (action$: Observable<Input>, store: MiddlewareAPI<S>, dependencies: D) => Observable<EpicAction<string, Output>>

export interface EpicAction<ActionType extends string, PayloadType> {
  type: ActionType
  payload?: PayloadType
  error?: boolean
}
