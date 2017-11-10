import { EffectModule, Module } from '../../../src'

@Module('dep_module4')
class DepModule4 extends EffectModule<void> {
  defaultState: any
  getData() {
    return 1729
  }
}

export default DepModule4
