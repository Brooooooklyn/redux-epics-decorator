import { exhaustMap } from 'rxjs/operators/exhaustMap'
import { map } from 'rxjs/operators/map'
import { mergeMap } from 'rxjs/operators/mergeMap'
import { takeUntil } from 'rxjs/operators/takeUntil'
import { of as just } from 'rxjs/observable/of'
import { Action } from 'redux-actions'
import { Observable } from 'rxjs/Observable'
import { push } from 'react-router-redux'
import * as sinon from 'sinon'

import { generateMsg, Msg } from '../service'
import {
  EffectModule,
  Module,
  Effect,
  Reducer,
  ModuleDispatchProps,
  DefineAction,
} from '../../../src'

export interface Module1StateProps {
  currentMsgId: string | null
  allMsgs: Msg[]
}

export const createActionPayloadCreator = sinon.spy()
export const createActionMetaCreator = sinon.spy()

@Module('one')
class Module1 extends EffectModule<Module1StateProps> {
  defaultState: Module1StateProps = {
    currentMsgId: null,
    allMsgs: [],
  }

  @DefineAction() dispose!: Observable<void>

  @DefineAction({
    createActionPayloadCreator,
    createActionMetaCreator,
  })
  noopAction!: Observable<void>

  @Reducer()
  dispose2(state: Module1StateProps) {
    return state
  }

  @Effect({
    success: (state: Module1StateProps, { payload }: Action<Msg>) => {
      const { allMsgs } = state
      return { ...state, allMsgs: allMsgs.concat([payload!]) }
    },
  })
  getMsg(action$: Observable<void>) {
    return action$.pipe(
      exhaustMap(() =>
        generateMsg().pipe(
          takeUntil(this.dispose),
          takeUntil(this.fromDecorated(this.dispose2)),
          map(this.createAction('success')),
        ),
      ),
    )
  }

  @Reducer()
  selectMsg(state: Module1StateProps, { payload }: Action<string>) {
    return { ...state, currentMsgId: payload }
  }

  @Reducer({
    createActionPayloadCreator,
    createActionMetaCreator,
  })
  noopReducer(state: Module1StateProps) {
    return state
  }

  @Effect()
  getModule3Msg(action$: Observable<void>) {
    return action$.pipe(
      map(() =>
        this.markAsGlobal({
          type: 'three_get_msg',
        }),
      ),
    )
  }

  @Effect()
  changeRouter(action$: Observable<void>) {
    return action$.pipe(mergeMap(() => just(push('/hmmm'))))
  }

  @Effect()
  undefinedEpic(action$: Observable<void>) {
    return action$
  }

  @Effect()
  nonActionEpic(action$: Observable<void>) {
    return action$.pipe(
      map(() => ({
        payload: 'foo',
      })),
    )
  }

  @Effect({
    createActionPayloadCreator,
    createActionMetaCreator,
  })
  noop(action$: Observable<void>) {
    return action$.pipe(map(() => this.createAction('noop')()))
  }
}

export type Module1DispatchProps = ModuleDispatchProps<Module1>

export default Module1
