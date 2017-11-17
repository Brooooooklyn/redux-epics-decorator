import { connect as reactConnect } from 'react-redux'
import { combineReducers, createStore, Store, compose, applyMiddleware } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { ReflectiveInjector, Injector  } from 'injection-js'
import { allDeps } from './decorators/Module'
import { Constructorof } from './EffectModule'

export interface Provider {
  provide: Function
  useClass: Function
}

export interface TestBedConfig {
  providers: Provider[]
}

export class TestBedFactory {

  static configureTestingModule(config?: TestBedConfig) {
    if (!config) {
      return new TestBed(ReflectiveInjector.resolveAndCreate(Array.from((allDeps as any))))
    }
    const newAllDeps = new Set(allDeps as any)
    const providers = config.providers
    providers.forEach(provider => this.replaceDep(provider, newAllDeps))
    const testbed = new TestBed(this.configInjector(newAllDeps))
    return testbed
  }

  private static replaceDep = (provider: Provider, newAllDeps: Set<any>) => {
    const { provide } = provider
    /* istanbul ignore else*/
    if (newAllDeps.has(provide)) {
      newAllDeps.delete(provide)
      newAllDeps.add(provider)
    }
  }

  private static configInjector(newAllDeps: Set<any>) {
    const parent = ReflectiveInjector.resolveAndCreate(Array.from((allDeps as any)))
    return parent.resolveAndCreateChild(Array.from(newAllDeps as any))
  }
}

export class TestBed {

  constructor(private injector: Injector) {}

  getInstance<T = any>(ins: Constructorof<T>): T {
    return this.injector.get(ins)
  }

  connect(effectModule: any) {
    return (...args: any[]) => {
      const originalDispatch = args[1] || {}
      const module = this.getInstance(effectModule)
      Object.assign(originalDispatch, module.allDispatch)
      args[1] = originalDispatch
      return reactConnect.apply(null, args)
    }
  }

  setupStore<MockGlobalState>(name: string, m: any): Store<MockGlobalState> {
    const instance = this.getInstance(m)
    return createStore(combineReducers({ [name]: instance.reducer }), compose(
      applyMiddleware(createEpicMiddleware(instance.epic))
    ))
  }
}
