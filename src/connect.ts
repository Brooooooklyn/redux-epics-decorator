import { connect as reactConnect } from 'react-redux'

import { getInstance } from '../src/decorators/module'

export const connect = (effectModule: any) => {
  return function(...args: any[]) {
    const originalDispatch = args[1] || {}
    const { allDispatch } = getInstance(effectModule)
    Object.assign(originalDispatch, allDispatch)
    args[1] = originalDispatch
    return reactConnect.apply(null, args)
  }
}
