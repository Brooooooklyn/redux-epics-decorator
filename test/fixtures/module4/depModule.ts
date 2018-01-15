import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operators/map'

import { EffectModule, Module, Effect } from '../../../src'

export interface DepModule4StateProps {
  counter: number
}

@Module('depModule4')
export default class DepModule4 extends EffectModule<DepModule4StateProps> {
  defaultState = {
    counter: 0
  }

  getData() {
    return 1729
  }

  @Effect()
  exposedEpic(action$: Observable<number>) {
    return action$.pipe(
      map(p => this.createAction(
        'success',
        { counter: p }
      ))
    )
  }
}
