import { Action } from 'redux-actions'

import { EffectModule } from './Module'

export type ModuleActionProps <S, T extends EffectModule<S>> = {
  [key in keyof T]: (...args: any[]) => Action<any>
}
