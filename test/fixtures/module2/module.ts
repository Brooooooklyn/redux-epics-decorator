import { of as just } from 'rxjs/observable/of'
import { range } from 'rxjs/observable/range'
import { concat } from 'rxjs/operators/concat'
import { exhaustMap } from 'rxjs/operators/exhaustMap'
import { map } from 'rxjs/operators/map'
import { mergeMap } from 'rxjs/operators/mergeMap'
import { takeUntil } from 'rxjs/operators/takeUntil'
import { withLatestFrom } from 'rxjs/operators/withLatestFrom'
import { toArray } from 'rxjs/operators/toArray'
import { Action } from 'redux-actions'
import { Observable } from 'rxjs/Observable'

import { generateMsg, Msg } from '../service'
import { EffectModule, Module, Effect, Reducer, ModuleActionProps } from '../../../src'

export interface Module2StateProps {
  currentMsgId: string | null
  allMsgs: Msg[]
  loading: boolean
}

@Module('module2')
class Module2 extends EffectModule<Module2StateProps> {
  defaultState: Module2StateProps = {
    currentMsgId: null,
    allMsgs: [],
    loading: false
  }

  @Effect()
  dispose(action$: Observable<any>) {
    return action$
  }

  @Effect()
  getMsg(current$: Observable<void>, { state$, action$ }: any) {
    return current$
      .pipe(
        mergeMap(() => generateMsg()
          .pipe(
            withLatestFrom(state$, (msg: Msg, state: any) => ({
              type: 'success',
              payload: {
                allMsgs: state.allMsgs.concat(msg),
                loading: false
              }
            })),
            takeUntil(this.dispose(action$))
          )
        )
      )
  }

  @Reducer()
  selectMsg(state: Module2StateProps, { payload }: Action<string>) {
    return { ...state, currentMsgId: payload }
  }

  @Effect()
  loadMsgs(current$: Observable<void>) {
    return current$
      .pipe(
        exhaustMap(() => range(0, 10)
          .pipe(
            map(this.createActionFrom(this.getMsg))
          )
        )
      )
  }

  @Effect()
  loadFiveMsgs(current$: Observable<void>, { state$, action$ }: any) {
    return current$
      .pipe(
        exhaustMap(() => {
          const request$ = range(0, 5)
            .pipe(
              mergeMap(() => generateMsg()
                .pipe(
                  takeUntil(this.dispose(action$))
                )
              ),
              toArray(),
              withLatestFrom(state$, this.setMsgs)
            )
          return just({ type: 'loading', loading: true })
            .pipe(concat(request$))
        })
      )
  }

  private setMsgs(msg: any, state: Module2StateProps) {
    return { type: 'success', payload: { allMsgs: state.allMsgs.concat(msg) } }
  }
}

export type Module2DispatchProps = ModuleActionProps<Module2StateProps, Module2>

export default Module2
