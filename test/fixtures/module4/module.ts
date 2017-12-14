import { map } from 'rxjs/operators/map'
import { startWith } from 'rxjs/operators/startWith'
import { withLatestFrom } from 'rxjs/operators/withLatestFrom'
import { _throw } from 'rxjs/observable/throw'
import { Observable } from 'rxjs/Observable'

import { EffectModule, Module, Effect, ModuleActionProps } from '../../../src'
import DepModule from './depModule'

export interface Module4StateProps {
  count: number
}

@Module('module4')
export default class Module4 extends EffectModule<Module4StateProps> {
  defaultState: Module4StateProps = {
    count: 0
  }

  constructor(private depModule: DepModule) {
    super()
  }

  getData() {
    return this.depModule.getData()
  }

  @Effect()
  setData(current$: Observable<void>) {
    return current$.pipe(
      map(() => ({
        type: 'success',
        payload: this.getData()
      }))
    )
  }

  @Effect()
  add(action$: Observable<void>, { state$ }: any) {
    return action$
      .pipe(
        withLatestFrom(state$, (_, state: Module4StateProps) => ({
          type: 'success',
          payload: {
            count: state.count + 1
          }
        }))
      )
  }

  @Effect()
  dispatchOtherModulesAction(action$: Observable<void>) {
    return action$.pipe(
      startWith(this.createActionFrom(this.depModule.exposedEpic)(2))
    )
  }

  @Effect()
  errorEpic(action$: Observable<void>) {
    return action$.pipe(
      map(() => _throw(new TypeError()) as any)
    )
  }
}

export type Module4DispatchProps = ModuleActionProps<Module4StateProps, Module4>
