import { Action } from 'redux-actions'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { EffectModule, Module, Reducer, Effect } from '../../../src'

export interface DepModule4StateProps {
  counter: number
}

@Module('dep_module4')
export default class DepModule4 extends EffectModule<DepModule4StateProps> {
  defaultState = {
    counter: 0,
  }

  getData() {
    return 1729
  }

  @Reducer()
  exposedReducer(state: DepModule4StateProps, action: Action<number>) {
    return { ...state, counter: action.payload! }
  }

  @Effect({
    success: (state: DepModule4StateProps, action: Action<number>) => {
      return { ...state, counter: action.payload! }
    },
  })
  exposedEpic(action$: Observable<number>) {
    return action$.pipe(map((p) => this.createAction('success')(p)))
  }
}
