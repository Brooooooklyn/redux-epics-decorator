import 'reflect-metadata'
import 'rxjs/add/operator/mergeMap'
import { Observable } from 'rxjs/Observable'
import { combineEpics } from 'redux-observable'
import { MiddlewareAPI } from 'redux'
import { ActionFunctionAny, Reducer, handleActions, createAction, Action } from 'redux-actions'

import { symbolDispatch, symbolReducerMap, symbolEpics, symbolAction, symbolNamespace, symbolNotTrasfer } from './symbol'

export type EpicLike<T, U, S, D = any> = (action$: Observable<Action<T>>, store: MiddlewareAPI<S>, dependencies: D) => Observable<Action<U>>

export abstract class EffectModule<StateProps> {

  abstract defaltState: StateProps

  private readonly ctor = this.constructor.prototype.constructor

  protected readonly createAction: <T>(actionType: string) => (...args: any[]) => Action<T> = createAction

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
    return handleActions(reducers, this.defaltState)
  }

  protected createActionFrom<T, U, S, D = any>(epic: EpicLike<T, U, S, D>): (...args: any[]) => Observable<Action<U>>

  protected createActionFrom<S, T>(reducer: Reducer<S, T>): (...args: any[]) => Action<T>

  protected createActionFrom<T, U, S, D = any>(epicOrReducer: EpicLike<T, U, S, D> | Reducer<S, T>) {
    const action = epicOrReducer[symbolAction]
    return function(...args: any[]) {
      const result = action.apply(null, args)
      result[symbolNotTrasfer] = true
      return result
    }
  }
}
