import { map } from 'rxjs/operators/map'
import { Observable } from 'rxjs/Observable'

import { EffectModule, Module, Effect, ModuleActionProps, Reducer } from '../../../src'
import DepModule from './depModule'

export interface Module4StateProps {
  count: number
}

@Module('four')
class Module4 extends EffectModule<Module4StateProps> {
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
}

export type Module4DispatchProps = ModuleActionProps<Module4StateProps, Module4>

export default Module4
