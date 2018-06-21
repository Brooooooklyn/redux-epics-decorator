import {
  concat,
  map,
  mergeMap,
  takeUntil,
  exhaustMap,
  toArray,
} from 'rxjs/operators'
import { Action } from 'redux-actions'
import { Observable, of as just, range } from 'rxjs'

import { generateMsg, Msg } from '../service'
import {
  EffectModule,
  Module,
  Effect,
  Reducer,
  ModuleDispatchProps,
  DefineAction,
} from '../../../src'

export interface Module2StateProps {
  currentMsgId: string | null
  allMsgs: Msg[]
  loading: boolean
}

@Module('two')
class Module2 extends EffectModule<Module2StateProps> {
  defaultState: Module2StateProps = {
    currentMsgId: null,
    allMsgs: [],
    loading: false,
  }

  @DefineAction() dispose!: Observable<void>

  @Effect({
    success: (state: Module2StateProps, { payload }: Action<Msg>) => {
      const { allMsgs } = state
      return { ...state, allMsgs: allMsgs.concat([payload!]), loading: false }
    },
  })
  getMsg(action$: Observable<void>) {
    return action$.pipe(
      mergeMap(() =>
        generateMsg().pipe(
          takeUntil(this.dispose),
          // or map(this.createAction('success'))
          map((msg) => this.createAction('success')(msg)),
        ),
      ),
    )
  }

  @Reducer()
  selectMsg(state: Module2StateProps, { payload }: Action<string>) {
    return { ...state, currentMsgId: payload }
  }

  @Effect()
  loadMsgs(action$: Observable<void>) {
    return action$.pipe(
      exhaustMap(() =>
        range(0, 10).pipe(
          // or map(this.createActionFrom(this.getMsg))
          map((index) => this.createActionFrom(this.getMsg)(index)),
        ),
      ),
    )
  }

  @Effect({
    loading: (state: Module2StateProps) => {
      return { ...state, loading: true }
    },
  })
  loadFiveMsgs(action$: Observable<void>) {
    return action$.pipe(
      exhaustMap(() => {
        const request$ = range(0, 5).pipe(
          mergeMap(() => generateMsg().pipe(takeUntil(this.dispose))),
          toArray(),
          map(this.createActionFrom(this.setMsgs)),
        )
        return just(this.createAction('loading')()).pipe(concat(request$))
      }),
    )
  }

  @Reducer()
  private setMsgs(state: Module2StateProps, { payload }: Action<Msg[]>) {
    const { allMsgs } = state
    return { ...state, allMsgs: allMsgs.concat(payload!) }
  }
}

export type Module2DispatchProps = ModuleDispatchProps<Module2>

export default Module2
