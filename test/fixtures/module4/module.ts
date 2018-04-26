import { map } from 'rxjs/operators/map'
import { mergeMap } from 'rxjs/operators/mergeMap'
import { startWith } from 'rxjs/operators/startWith'
import { _throw } from 'rxjs/observable/throw'
import { Observable } from 'rxjs/Observable'
import { Action } from 'redux-actions'

import {
  EffectModule,
  Module,
  Effect,
  ModuleDispatchProps,
  Reducer,
} from '../../../src'
import DepModule from './depModule'

export interface Module4StateProps {
  count: number
  syncFromDepModuleCounter: number
}

@Module('four')
export default class Module4 extends EffectModule<Module4StateProps> {
  defaultState: Module4StateProps = {
    count: 0,
    syncFromDepModuleCounter: 0,
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
    },
  })
  add(action$: Observable<void>) {
    return action$.pipe(map(this.createAction('success')))
  }

  @Effect({
    success: (state: Module4StateProps, { payload }: Action<number>) => {
      return { ...state, syncFromDepModuleCounter: payload }
    },
  })
  dispatchOtherModulesEffect(action$: Observable<number>) {
    return this.depModule.exposedEpic(action$)
  }

  @Effect()
  dispatchOtherModulesAction(action$: Observable<void>) {
    return action$.pipe(
      map(() => this.createActionFrom(this.depModule.exposedReducer)(2)),
      startWith(this.createActionFrom(this.depModule.exposedEpic)(2)),
    )
  }

  @Effect()
  errorEpic(action$: Observable<void>) {
    return action$.pipe(mergeMap(() => _throw(new TypeError())))
  }
}

export type Module4DispatchProps = ModuleDispatchProps<Module4>
