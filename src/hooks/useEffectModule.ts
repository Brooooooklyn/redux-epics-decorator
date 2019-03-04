import { useEffect, useState, useContext } from 'react'
import { bindActionCreators } from 'redux'
import { ReactReduxContext } from 'react-redux'

import { ModuleDispatchProps } from '../interface'
import { Constructorof, EffectModule } from '../EffectModule'
import { getInstance } from '../decorators'

export function useEffectModule<
  State,
  GlobalState,
  Module extends EffectModule<any>
>(
  M: Constructorof<Module>,
  mapStateToProps: (state: GlobalState) => State,
): [State, ModuleDispatchProps<Module>] {
  const { store, storeState } = useContext(ReactReduxContext)
  const [state, setState] = useState(mapStateToProps(storeState))

  useEffect(
    () =>
      store.subscribe(() => {
        const currentState = mapStateToProps(store.getState())
        setState(currentState)
      }),
    [state],
  )

  return [
    state,
    bindActionCreators(
      getInstance(M).allDispatch,
      store.dispatch,
    ) as ModuleDispatchProps<Module>,
  ]
}
