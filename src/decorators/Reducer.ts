import { createAction } from 'redux-actions'

import { EffectModule } from '../Module'
import { currentReducers, currentSetEffectQueue } from '../shared'
import { symbolNamespace, symbolDispatch } from '../symbol'

export const Reducer = <S>(actionName: string) => {
  return (target: EffectModule<S>, method: string, descriptor: PropertyDescriptor) => {

    const reducer = descriptor.value
    const constructor = target.constructor

    function setup() {
      const name = Reflect.getMetadata(symbolNamespace, constructor)
      if (!name) {
        const moduleName = constructor.name
        throw new TypeError(`Fail to decorate ${ moduleName }.${ method }, Class ${ moduleName } must have namespace metadata`)
      }
      const dispatchs = Reflect.getMetadata(symbolDispatch, constructor)
      const actionWithNamespace = `${ name }/${ actionName }`
      const startAction = createAction(actionWithNamespace)
      currentReducers.set(actionWithNamespace, reducer)
      dispatchs[method] = startAction
    }

    currentSetEffectQueue.push(setup)

    return {
      ...descriptor,
      value: reducer
    }
  }
}
