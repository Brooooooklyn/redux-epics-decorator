import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operators/map'

import { EffectModule, Module, Effect } from '../../../src'

export interface DepModule4StateProps {
  counter: number
}

@Module('dep_module4')
export default class DepModule4 extends EffectModule<DepModule4StateProps> {
  defaultState = {
    counter: 0
  }

  getData() {
    return 1729
  }

  @Effect({
    success: (state: DepModule4StateProps, action: Action<number>) => {
      return { ...state, counter: action.payload! }
    }
  })
  exposedEpic(action$: Observable<number>) {
    return action$.pipe(
      map(p => this.createAction('success')(p))
    )
  }
}
