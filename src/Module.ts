import 'reflect-metadata'
import 'rxjs/add/operator/mergeMap'
import { combineEpics } from 'redux-observable'
import { ActionFunctionAny, Reducer, handleActions, createAction } from 'redux-actions'

import { symbolDispatch, symbolReducerMap, symbolEpics, symbolAction, symbolNamespace, symbolNotTrasfer } from './symbol'
import { EpicAction, EpicLike } from './interface'

export abstract class EffectModule<StateProps> {

  abstract defaultState: StateProps

  private readonly ctor = this.constructor.prototype.constructor

  protected readonly createAction: <ActionType extends string>(actionType: ActionType) => <T>(payload: T) => EpicAction<ActionType, T> = createAction

  constructor() {
    const name = Reflect.getMetadata(symbolNamespace, this.ctor)
    if (!name) {
      throw new TypeError('Should be decorator by @namespcae')
    }
  }

  // @internal
  get allDispatch(): { [key: string]: ActionFunctionAny<StateProps> } {
    return Reflect.getMetadata(symbolDispatch, this.ctor)
  }

  get epic() {
    return combineEpics(...Reflect.getMetadata(symbolEpics, this.ctor).map((epic: any) => epic.bind(this)))
  }

  get reducer(): Reducer<StateProps, any> {
    const reducersMap: Map<string, Function> = Reflect.getMetadata(symbolReducerMap, this.ctor)
    const reducers = { }
    reducersMap.forEach((reducer, key) => {
      reducers[key] = reducer.bind(this)
    })
    return handleActions(reducers, this.defaultState)
  }

  protected createActionFrom<C extends EffectModule<StateProps>, ActionTypes extends keyof C, T, U, S, D = any>(this: C, epic: EpicLike<void, U, S, D>): () => EpicAction<ActionTypes, T>

  protected createActionFrom<C extends EffectModule<StateProps>, ActionTypes extends keyof C, T, U, S, D = any>(this: C, epic: EpicLike<T, U, S, D>): (payload: T) => EpicAction<ActionTypes, T>

  protected createActionFrom<C extends EffectModule<StateProps>, ActionTypes extends keyof C, S, T>(this: C, reducer: Reducer<S, void>): () => EpicAction<ActionTypes, T>

  protected createActionFrom<C extends EffectModule<StateProps>, ActionTypes extends keyof C, S, T>(this: C, reducer: Reducer<S, T>): (payload: T) => EpicAction<ActionTypes, T>

  protected createActionFrom<C extends EffectModule<StateProps>, ActionTypes extends keyof C, T, U, S, D = any>(this: C, epicOrReducer: EpicLike<T, U, S, D> | Reducer<S, T>) {
    const action = epicOrReducer[symbolAction]
    return function(...args: any[]) {
      const result = action.apply(null, args)
      result[symbolNotTrasfer] = true
      return result as EpicAction<ActionTypes, T>
    }
  }
}
