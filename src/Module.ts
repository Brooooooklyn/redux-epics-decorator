import 'reflect-metadata'
import 'rxjs/add/operator/mergeMap'
import { combineEpics, Epic } from 'redux-observable'
import { ActionFunctionAny, Reducer, handleActions, createAction, Action } from 'redux-actions'

import { symbolDispatch, symbolReducerMap, symbolEpics, symbolAction, symbolNamespace, symbolNotTrasfer } from './symbol'

export abstract class EffectModule<StateProps> {

  abstract defaltState: StateProps

  private readonly ctor = this.constructor.prototype.constructor

  protected readonly createAction = createAction

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

  protected createActionFrom<T, A extends Action<T>, S, D = any>(epic: Epic<A, S, D> | Reducer<S, T>) {
    const action = epic[symbolAction]
    return function(...args: any[]) {
      const result = action.apply(null, args)
      result[symbolNotTrasfer] = true
      return result
    }
  }
}
