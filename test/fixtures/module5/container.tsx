import React from 'react'

import { useModule } from '../../../src/hooks'
import { Module5 } from './module'
import { GlobalState } from '../store'

export function Container5() {
  const stateProps = useModule(Module5, (state: GlobalState) => state.module5)
  stateProps
}
