import { MapStateToProps, connect as reactConnect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { EffectModule } from './Module'

export const connect = <P, S>(mapStateToProps: MapStateToProps<P, S>, effectModules: EffectModule<P>) => {
  const { allDispatch } = effectModules
  return (comp: any) => reactConnect(mapStateToProps, (dispatch: Dispatch<P>) => bindActionCreators(
    allDispatch, dispatch
  ))(comp) as any
}
