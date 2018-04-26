import { connect as reactConnect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { getInstance } from './decorators/Module'

export const connect = (effectModule: any) => {
  return function(...args: any[]) {
    const originalDispatch = args[1] || {}
    const { allDispatch } = getInstance(effectModule)
    args[1] = (dispatch: any, ownProps: any) => ({
      ...bindActionCreators(allDispatch, dispatch),
      ...(typeof originalDispatch === 'function'
        ? originalDispatch.call(null, dispatch, ownProps)
        : bindActionCreators(originalDispatch, dispatch)),
    })
    return reactConnect.apply(null, args)
  }
}
