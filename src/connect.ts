import {
  connect as reactConnect,
  MapDispatchToPropsParam,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { getInstance } from './decorators/Module'
import { Constructorof, EffectModule } from './EffectModule'
import { ModuleDispatchProps } from './interface'

export const connect = <Module extends EffectModule<any>>(
  effectModule: Constructorof<Module>,
) => {
  /**
   * TODO
   * support more connect params
   */
  return function<
    GlobalState,
    StateProps,
    OwnProps = {},
    OtherDisptchProps = {}
  >(
    mapStateToProps: MapStateToProps<StateProps, OwnProps, GlobalState>,
    mapDispatchToProps?: MapDispatchToPropsParam<OtherDisptchProps, OwnProps>,
  ) {
    const { allDispatch } = getInstance(effectModule)
    const mapDispatchToPropsFn = (dispatch: Dispatch, ownProps: OwnProps) =>
      ({
        ...bindActionCreators(allDispatch, dispatch),
        ...(!mapDispatchToProps
          ? {}
          : typeof mapDispatchToProps === 'function'
          ? (mapDispatchToProps as MapDispatchToPropsFunction<
              OtherDisptchProps,
              OwnProps
            >).call(null, dispatch, ownProps)
          : bindActionCreators(mapDispatchToProps as {}, dispatch)),
      } as ModuleDispatchProps<Module> & OtherDisptchProps)
    return reactConnect<
      StateProps,
      ModuleDispatchProps<Module> & OtherDisptchProps,
      OwnProps,
      GlobalState
    >(mapStateToProps, mapDispatchToPropsFn)
  }
}
