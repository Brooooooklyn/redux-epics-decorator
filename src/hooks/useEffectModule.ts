import { useEffect, useState, useContext } from 'react'
import { bindActionCreators } from 'redux'
import { ReactReduxContext } from 'react-redux'
import { useInstance } from '@asuka/di'

import { ModuleDispatchProps } from '../interface'
import { Constructorof, EffectModule } from '../EffectModule'

export function useEffectModule<
  State,
  GlobalState,
  Module extends EffectModule<any>
>(
  M: Constructorof<Module>,
  mapStateToProps: (state: GlobalState) => State,
): [State, ModuleDispatchProps<Module>] {
  const { store } = useContext(ReactReduxContext)
  const [state, setState] = useState(mapStateToProps(store.getState()))

  useEffect(
    () =>
      store.subscribe(() => {
        const currentState = mapStateToProps(store.getState())
        setState(currentState)
      }),
    [state],
  )

  const effectModule = useInstance(M)

  return [
    state,
    bindActionCreators(
      effectModule.allDispatch,
      store.dispatch,
    ) as ModuleDispatchProps<Module>,
  ]
}
