import { createAction } from 'redux-actions'

import { currentReducers, currentSetEffectQueue } from '../shared'
import { symbolNamespace, symbolDispatch, symbolAction, withNamespace } from '../symbol'

export const Reducer = () => {
  return (target: any, method: string, descriptor: PropertyDescriptor) => {

    const reducer = descriptor.value
    const constructor = target.constructor

    function setup() {
      const name = Reflect.getMetadata(symbolNamespace, constructor)
      const dispatchs = Reflect.getMetadata(symbolDispatch, constructor)
      const actionWithNamespace = withNamespace(name, method)
      const startAction = createAction(actionWithNamespace)
      currentReducers.set(actionWithNamespace, reducer)
      dispatchs[method] = startAction

      Object.defineProperty(reducer, symbolAction, {
        enumerable: false,
        configurable: false,
        value: startAction
      })
    }

    currentSetEffectQueue.push(setup)

    return {
      ...descriptor,
      value: reducer
    }
  }
}
