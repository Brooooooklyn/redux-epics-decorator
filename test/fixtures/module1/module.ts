import { exhaustMap } from 'rxjs/operators/exhaustMap'
import { map } from 'rxjs/operators/map'
import { mergeMap } from 'rxjs/operators/mergeMap'
import { takeUntil } from 'rxjs/operators/takeUntil'
import { withLatestFrom } from 'rxjs/operators/withLatestFrom'
import { of as just } from 'rxjs/observable/of'
import { Observable } from 'rxjs/Observable'
import { push } from 'react-router-redux'

import { generateMsg, Msg } from '../service'
import { EffectModule, Module, Effect, ModuleActionProps } from '../../../src'

export interface Module1StateProps {
  currentMsgId: string | null
  allMsgs: Msg[]
}

@Module('module1')
class Module1 extends EffectModule<Module1StateProps> {
  defaultState: Module1StateProps = {
    currentMsgId: null,
    allMsgs: []
  }

  @Effect()
  dispose(current$: Observable<void>) {
    return current$
  }

  @Effect()
  dispose2(current$: Observable<void>) {
    return current$
  }

  @Effect()
  getMsg(current$: Observable<void>, { state$, action$ }: any) {
    return current$
      .pipe(
        exhaustMap(() => generateMsg()
          .pipe(
            withLatestFrom(state$, (msg: Msg, state: any) => this.createAction(
              'message',
              { allMsgs: state.allMsgs.concat(msg) }
            )),
            takeUntil(this.dispose(action$)),
            takeUntil(this.dispose2(action$))
          )
        )
      )
  }

  @Effect()
  selectMsg(current$: Observable<string>) {
    return current$.pipe(
      map((currentMsgId: string) => this.createAction('currentMsgId', {
        currentMsgId
      }))
    )
  }

  @Effect()
  getModule3Msg(current$: Observable<void>) {
    return current$
      .pipe(
        map(() => this.markAsGlobal({
          type: 'three_get_msg'
        }))
      )
  }

  @Effect()
  changeRouter(current$: Observable<void>) {
    return current$
      .pipe(
        mergeMap(() => just(push('/hmmm')))
      )
  }

  @Effect()
  nonActionEpic(current$: Observable<void>) {
    return current$.pipe(
      map(() => () => ({ func: 'function' }))
    )
  }

  @Effect()
  noop(current$: Observable<void>) {
    return current$
  }

}

export type Module1DispatchProps = ModuleActionProps<Module1StateProps, Module1>

export default Module1
