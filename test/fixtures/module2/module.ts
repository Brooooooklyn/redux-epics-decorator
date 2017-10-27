import { of as just } from 'rxjs/observable/of'
import { range } from 'rxjs/observable/range'
import { concat } from 'rxjs/operators/concat'
import { exhaustMap } from 'rxjs/operators/exhaustMap'
import { map } from 'rxjs/operators/map'
import { mergeMap } from 'rxjs/operators/mergeMap'
import { takeUntil } from 'rxjs/operators/takeUntil'
import { toArray } from 'rxjs/operators/toArray'

import { Action } from 'redux-actions'
import { Observable } from 'rxjs/Observable'

import { generateMsg, Msg } from '../service'
import { EffectModule, namespace, Effect, Reducer, ModuleActionProps, DefineAction } from '../../../src'

export interface Module2StateProps {
  currentMsgId: string | null
  allMsgs: Msg[]
  loading: boolean
}

@namespace('two')
class Module2 extends EffectModule<Module2StateProps> {
  defaultState: Module2StateProps = {
    currentMsgId: null,
    allMsgs: [],
    loading: false
  }

  @DefineAction('dispose') dispose: Observable<Action<void>>

  @Effect('get_msg')({
    success: (state: Module2StateProps, { payload }: Action<Msg>) => {
      const { allMsgs } = state
      return { ...state, allMsgs: allMsgs.concat([payload!]), loading: false }
    }
  })
  getMsg(action$: Observable<void>) {
    return action$
      .pipe(
        mergeMap(() => generateMsg()
          .pipe(
            takeUntil(this.dispose),
            map(msg => this.createAction('success')(msg))
          )
        )
      )
  }

  @Reducer('select_msg')
  selectMsg(state: Module2StateProps, { payload }: Action<string>) {
    return { ...state, currentMsgId: payload }
  }

  @Effect('get_10_msg')()
  loadMsgs(action$: Observable<void>) {
    return action$
      .pipe(
        exhaustMap(() => range(0, 10)
          .pipe(
            map(() => this.createActionFrom(this.getMsg)())
          )
        )
      )
  }

  @Effect('get_5_msg')({
    loading: (state: Module2StateProps) => {
      return { ...state, loading: true }
    }
  })
  loadFiveMsgs(action$: Observable<void>) {
    return action$
      .pipe(
        exhaustMap(() => {
          const request$ = range(0, 5)
            .pipe(
              mergeMap(() => generateMsg()
                .pipe(
                  takeUntil(this.dispose)
                )
              ),
              toArray(),
              map(this.createActionFrom(this.setMsgs))
            )
          return just(this.createAction('loading')())
            .pipe(concat(request$))
        })
      )
  }

  @Reducer('set_msgs')
  private setMsgs(state: Module2StateProps, { payload }: Action<Msg[]>) {
    const { allMsgs } = state
    return { ...state, allMsgs: allMsgs.concat(payload!) }
  }
}

export type Module2DispatchProps = ModuleActionProps<Module2StateProps, Module2>

const moduleTwo = new Module2
export default moduleTwo
export const reducer = moduleTwo.reducer
export const epic = moduleTwo.epic
