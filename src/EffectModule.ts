import 'reflect-metadata'
import { combineEpics } from 'redux-observable'
import { ActionFunctionAny, Reducer, Action, createAction } from 'redux-actions'

import { symbolDispatch, symbolEpics, symbolAction, symbolNamespace, symbolNotTrasfer, withNamespace } from './symbol'
import { EpicAction, EpicLike } from './interface'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { map } from 'rxjs/operators/map'
import { startsWith } from './startsWith'

export interface CreateAction<ActionType extends string> {
  <T>(payload: T): EpicAction<ActionType, T>
  (): EpicAction<ActionType, void>
}

export abstract class EffectModule<StateProps> {

  abstract readonly defaultState: StateProps

  private readonly ctor = this.constructor.prototype.constructor

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

  // @internal
  get epic() {
    const name = Reflect.getMetadata(symbolNamespace, this.ctor)
    const epics = Reflect.getMetadata(symbolEpics, this.ctor)
      .map((epic: any) => epic.bind(this))
    return (action$: any, store: any, dependencies: any) => {
      const state$ = new BehaviorSubject(this.defaultState[name])
      action$.pipe(map(() => store.getState()[name])).subscribe(state$)
      return combineEpics(...epics)(action$, state$, dependencies)
    }
  }

  // @internal
  get reducer(): Reducer<StateProps, any> {
    const name = Reflect.getMetadata(symbolNamespace, this.ctor)
    return (state: any = this.defaultState, action: Action<any>) => {
      return startsWith(action.type, name)
        ? { ...state, ...action.payload }
        : state
    }
  }

  protected createAction<ActionType extends string, T = any>(actionType: ActionType): (payload?: T) => EpicAction<ActionType, T>
  protected createAction<ActionType extends string, T = any>(actionType: ActionType, ...args: any[]): (payload?: T) => EpicAction<ActionType, T>
  protected createAction(...args: any[]) {
    return createAction.apply(null, args)
  }

  protected createActionFrom<Input, S>
    (epic: EpicLike<void, any, S, any>): () => EpicAction<string, Input>

  protected createActionFrom<T, O, S>
    (epic: EpicLike<T, O, S, string>): (payload: T) => EpicAction<string, O>

  protected createActionFrom<T, S>
    (reducer: Reducer<S, void>): () => EpicAction<string, T>

  protected createActionFrom<S, T>
    (reducer: Reducer<S, T>): (payload: T) => EpicAction<string, T>

  protected createActionFrom<S, T>
    (epicOrReducer: EpicLike<T, any, S, any> | Reducer<S, T>) {
      const actionCreator = epicOrReducer[symbolAction]
      if (!actionCreator) {
        throw new TypeError('Could not createActionFrom a non-decoratored method')
      }
      return function(...args: any[]) {
        const result = actionCreator.apply(null, args)
        result[symbolNotTrasfer] = true
        return result as EpicAction<string, T>
      }
    }

  // giveup type check
  protected markAsGlobal<T>(action: Action<T>): any {
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      console.warn('using markAsGlobal is a bad practice, consider about using this.createActionFrom(module#something) instead')
    }
    action[symbolNotTrasfer] = true
    return action as any
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
