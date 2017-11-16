import 'reflect-metadata'
import { combineEpics, ofType } from 'redux-observable'
import { ActionFunctionAny, Reducer, handleActions, createAction, Action } from 'redux-actions'
import { Dispatch } from 'redux'
import { empty } from 'rxjs/observable/empty'

import { symbolDispatch, symbolReducerMap, symbolEpics, symbolAction, symbolNamespace, symbolNotTrasfer, withNamespace } from './symbol'
import { EpicAction, EpicLike } from './interface'
import { Observable } from 'rxjs/Observable'

export interface CreateAction<ActionType extends string> {
  <T>(payload: T): EpicAction<ActionType, T>
  (): EpicAction<ActionType, void>
}

export abstract class EffectModule<StateProps> {

  abstract readonly defaultState: StateProps

  private readonly ctor = this.constructor.prototype.constructor
  private moduleAction$: Observable<Action<any>>

  protected readonly createAction: <ActionType extends string>(actionType: ActionType) =>
  CreateAction<ActionType> = createAction

  readonly dispatch: Dispatch<any>

  constructor() {
    const name = Reflect.getMetadata(symbolNamespace, this.ctor)
    if (!name) {
      throw new TypeError('Should be decorator by @namespcae')
    }
  }

  private moduleEpic = <T> (action$: Observable<Action<T>>) => {
    this.moduleAction$ = action$
    return empty()
  }

  // @internal
  get allDispatch(): { [key: string]: ActionFunctionAny<StateProps> } {
    return Reflect.getMetadata(symbolDispatch, this.ctor)
  }

  get epic() {
    return combineEpics(this.moduleEpic, ...Reflect.getMetadata(symbolEpics, this.ctor).map((epic: any) => epic.bind(this)))
  }

  get reducer(): Reducer<StateProps, any> {
    const reducersMap: Map<string, Function> = Reflect.getMetadata(symbolReducerMap, this.ctor)
    const reducers = { }
    reducersMap.forEach((reducer, key) => {
      reducers[key] = reducer.bind(this)
    })
    return handleActions(reducers, this.defaultState)
  }

  protected fromDecorated<T> (method: Reducer<any, T> | EpicLike<T, any, any, any>) {
    const action = method[symbolAction]
    return this.moduleAction$.pipe(
      ofType(action)
    ) as Observable<Action<T>>
  }

  protected createActionFrom<C extends EffectModule<StateProps>, ActionTypes extends keyof C, Input, S>
    (this: C, epic: EpicLike<void, any, S, any>): () => EpicAction<ActionTypes, Input>

  protected createActionFrom<C extends EffectModule<StateProps>, ActionTypes extends keyof C, T, S>
    (this: C, epic: EpicLike<T, any, S, any>): (payload: T) => EpicAction<ActionTypes, T>

  protected createActionFrom<C extends EffectModule<StateProps>, ActionTypes extends keyof C, T, S>
    (this: C, reducer: Reducer<S, void>): () => EpicAction<ActionTypes, T>

  protected createActionFrom<C extends EffectModule<StateProps>, ActionTypes extends keyof C, S, T>
    (this: C, reducer: Reducer<S, T>): (payload: T) => EpicAction<ActionTypes, T>

  protected createActionFrom<C extends EffectModule<StateProps>, ActionTypes extends keyof C, S, T>
    (this: C, epicOrReducer: EpicLike<T, any, S, any> | Reducer<S, T>) {
      const action = epicOrReducer[symbolAction]
      return function(...args: any[]) {
        const result = action.apply(null, args)
        result[symbolNotTrasfer] = true
        return result as EpicAction<ActionTypes, T>
      }
    }

  protected markAsGlobal<T>(action: Action<T>) {
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      console.warn('using markAsGlobal is a bad practice, consider about using this.createActionFrom(module#something) instead')
    }
    action[symbolNotTrasfer] = true
    return action
  }
}

export interface Constructorof<T> {
  new (...args: any[]): T
}

type Diff<T extends string, U extends string> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T]
type UseLessAction = 'dispatch' | 'epic' | 'reducer' | 'allDispatch'

export const getAction = <T> (target: Constructorof<T>, actionName: Diff<keyof T, UseLessAction>) => {
   /* istanbul ignore next*/
  if (process.env.NODE_ENV === 'development') {
    console.warn('This is a temporary method for normal style.')
  }
  const name = Reflect.getMetadata(symbolNamespace, target)
  const actionWithNamespace = withNamespace(name, actionName)
  return createAction<any>(actionWithNamespace)
}
