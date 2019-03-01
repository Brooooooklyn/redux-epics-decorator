import { useContext, useState, useEffect } from 'react'
import { bindActionCreators } from 'redux'
import { ReactReduxContext } from 'react-redux'

import { EffectModule, Constructorof } from '../EffectModule'
import { getInstance } from '../decorators'
import { ModuleDispatchProps } from '../interface'

export interface DispatchProps {
  [index: string]: any
}

export function useModule<GlobalState, StateProps, M extends EffectModule<any>>(
  m: Constructorof<M>,
  stateSelector: (state: GlobalState) => StateProps,
  addtionalDispatchProps: DispatchProps = {},
): StateProps & ModuleDispatchProps<M> & DispatchProps {
  const { store, storeState: initialState } = useContext(ReactReduxContext)
  const initialStateProps = stateSelector(initialState)
  const [stateProps, setState] = useState(initialStateProps)
  useEffect(
    () => {
      const teardown = store.subscribe(() => {
        const currentState = store.getState()
        const currentStateProps = stateSelector(currentState)
        setState(currentStateProps)
      })
      return () => teardown()
    },
    [stateProps],
  )

  const moduleInstance = getInstance(m)
  return {
    ...(bindActionCreators(
      moduleInstance.allDispatch,
      store.dispatch,
    ) as ModuleDispatchProps<M>),
    ...stateProps,
    ...addtionalDispatchProps,
  }
}
