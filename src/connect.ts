import { MapStateToProps, connect as reactConnect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { EffectModule } from './Module'

export const connect = <P, S>(mapStateToProps: MapStateToProps<P, S>, effectModule: EffectModule<P>) => {
  const { allDispatch } = effectModule
  const dispatchMap = allDispatch || { }
  return (comp: any) => reactConnect(mapStateToProps, (componentDispatch: Dispatch<P>) => bindActionCreators(
    dispatchMap, componentDispatch
  ))(comp) as any
}
