import 'reflect-metadata'
import 'rxjs/add/operator/mergeMap'
import { combineEpics } from 'redux-observable'
import { ActionFunctionAny, Reducer, handleActions, createAction } from 'redux-actions'

import { symbolDispatch, symbolReducerMap, symbolEpics } from './Effect'

export abstract class EffectModule<StateProps> {

  abstract defaltState: StateProps

  private readonly ctor = this.constructor.prototype.constructor

  protected readonly createAction = createAction

  get dispatch(): { [key: string]: ActionFunctionAny<StateProps> } {
    return Reflect.getMetadata(symbolDispatch, this.ctor)
  }

  get epic() {
    return combineEpics(...Reflect.getMetadata(symbolEpics, this.ctor).map((epic: any) => epic.bind(this)))
  }

  get reducer(): Reducer<StateProps, any> {
    const reducersMap = Reflect.getMetadata(symbolReducerMap, this.ctor)
    return handleActions(reducersMap, this.defaltState)
  }
}
