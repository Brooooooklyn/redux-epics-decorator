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

export interface Module5StateProps {
  currentMsgId: string | null
  allMsgs: Msg[]
  loading: boolean
}

@Module('five')
export class Module5 extends EffectModule<Module5StateProps> {
  defaultState: Module5StateProps = {
    currentMsgId: null,
    allMsgs: [],
    loading: false,
  }

  @DefineAction() dispose!: Observable<void>

  @Effect({
    success: (state: Module5StateProps, { payload }: Action<Msg>) => {
      const { allMsgs } = state
      return { ...state, allMsgs: allMsgs.concat([payload!]), loading: false }
    },
  })
  getMsg(action$: Observable<void>) {
    return action$.pipe(
      mergeMap(() =>
        generateMsg().pipe(
          takeUntil(this.dispose),
          map(this.createAction('success')),
        ),
      ),
    )
  }

  @Reducer()
  selectMsg(state: Module5StateProps, { payload }: Action<string>) {
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
    loading: (state: Module5StateProps) => {
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
  private setMsgs(state: Module5StateProps, { payload }: Action<Msg[]>) {
    const { allMsgs } = state
    return { ...state, allMsgs: allMsgs.concat(payload!) }
  }
}

export type Module2DispatchProps = ModuleDispatchProps<Module5>
