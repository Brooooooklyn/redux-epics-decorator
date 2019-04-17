import 'reflect-metadata'
import { combineEpics, ofType } from 'redux-observable'
import {
  ActionFunctionAny,
  Reducer,
  handleActions,
  Action,
  createAction,
} from 'redux-actions'
import { empty, Observable } from 'rxjs'

import {
  symbolDispatch,
  symbolReducerMap,
  symbolEpics,
  symbolAction,
  symbolNamespace,
  symbolNotTrasfer,
  withNamespace,
} from './symbol'
import { EpicAction, EpicLike, UnpackPayload } from './interface'

export interface CreateAction<ActionType extends string> {
  <T>(payload: T): EpicAction<ActionType, T>
  (): EpicAction<ActionType, void>
}

export abstract class EffectModule<StateProps> {
  abstract readonly defaultState: StateProps

  private readonly ctor = this.constructor.prototype.constructor
  private moduleAction$: Observable<Action<any>> | null = null

  constructor() {
    const name = Reflect.getMetadata(symbolNamespace, this.ctor)
    if (!name) {
      throw new TypeError('Should be decorator by @Module')
    }
  }

  private moduleEpic = <T>(action$: Observable<Action<T>>) => {
    this.moduleAction$ = action$
    return empty()
  }

  // @internal
  get allDispatch(): { [key: string]: ActionFunctionAny<StateProps> } {
    return Reflect.getMetadata(symbolDispatch, this.ctor)
  }

  // @internal
  get epic() {
    return combineEpics(
      this.moduleEpic,
      ...Reflect.getMetadata(symbolEpics, this.ctor).map((epic: any) =>
        epic.bind(this),
      ),
    )
  }

  // @internal
  get reducer(): Reducer<StateProps, any> {
    const reducersMap: Map<string, Function> = Reflect.getMetadata(
      symbolReducerMap,
      this.ctor,
    )
    const reducers = {}
    reducersMap.forEach((reducer, key) => {
      reducers[key] = reducer.bind(this)
    })
    return handleActions(reducers, this.defaultState)
  }

  protected fromDecorated<T>(
    method: Reducer<any, T> | EpicLike<T, any, any, any>,
  ) {
    const action = method[symbolAction]
    return this.moduleAction$!.pipe(ofType(action)) as Observable<Action<T>>
  }

  protected createAction<ActionType extends string, T = any>(
    actionType: ActionType,
  ): (payload?: T) => EpicAction<ActionType, T>
  protected createAction<ActionType extends string, T = any>(
    actionType: ActionType,
    ...args: any[]
  ): (payload?: T) => EpicAction<ActionType, T>
  protected createAction(...args: any[]) {
    return (createAction as any).apply(null, args)
  }

  protected createActionFrom(epicOrReducer: any) {
    const actionCreator = epicOrReducer[symbolAction]
    if (!actionCreator) {
      throw new TypeError('Could not createActionFrom a non-decoratored method')
    }
    return function(...args: any[]) {
      const result = actionCreator.apply(null, args)
      Object.defineProperty(result, symbolNotTrasfer, { value: true })
      return result as EpicAction<string, any>
    }
  }

  // giveup type check
  protected markAsGlobal<T>(action: Action<T>): any {
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'using markAsGlobal is a bad practice, consider about using this.createActionFrom(module#something) instead',
      )
    }
    Object.defineProperty(action, symbolNotTrasfer, { value: true })
    return action as any
  }
}

export interface Constructorof<T> {
  new (...args: any[]): T
}

type UseLessAction = 'dispatch' | 'epic' | 'reducer' | 'allDispatch'

export const getAction = <M extends Exclude<keyof T, UseLessAction>, T extends EffectModule<any>>(
  target: Constructorof<T>,
  actionName: M,
) => {
  /* istanbul ignore next*/
  if (process.env.NODE_ENV === 'development') {
    console.warn('This is a temporary method for normal style.')
  }
  const name = Reflect.getMetadata(symbolNamespace, target)
  const actionWithNamespace = withNamespace(name, actionName as string)
  return createAction<UnpackPayload<T[M]>(actionWithNamespace)
}
