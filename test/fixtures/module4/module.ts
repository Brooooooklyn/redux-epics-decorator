import { map } from 'rxjs/operators/map'
import { startWith } from 'rxjs/operators/startWith'
import { Observable } from 'rxjs/Observable'

import { EffectModule, Module, Effect, ModuleActionProps, Reducer } from '../../../src'
import DepModule from './depModule'

export interface Module4StateProps {
  count: number
}

@Module('four')
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

  @Reducer()
  setData(state: Module4StateProps) {
    return { ...state, count: this.getData() }
  }

  @Effect({
    success: (state: Module4StateProps) => {
      return { ...state, count: state.count + 1 }
    }
  })
  add(action$: Observable<void>) {
    return action$
      .pipe(
        map(this.createAction('success'))
      )
  }

  @Effect()
  dispatchOtherModulesAction(action$: Observable<void>) {
    return action$.pipe(
      map(() => this.createActionFrom(this.depModule.exposedReducer)(2)),
      startWith(this.createActionFrom(this.depModule.exposedEpic)(2))
    )
  }
}

export type Module4DispatchProps = ModuleActionProps<Module4StateProps, Module4>
