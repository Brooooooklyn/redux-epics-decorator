import { allDeps } from './decorators/Module'
import { ReflectiveInjector, Injector  } from 'injection-js'

export interface Provider {
  provide: Function
  useClass: Function
}

export interface TestBedConfig {
  providers: Provider[]
}

export class TestBed {
  private newAllDeps: Set<any>

  constructor() {
    this.newAllDeps = new Set(allDeps as any)
  }

  configureTestingModule(config: TestBedConfig) {
    this.newAllDeps = new Set(allDeps as any)
    const providers = config.providers
    providers.forEach(this.replaceDep)
    this.configInjector()
  }

  private replaceDep = (provider: Provider) => {
    const { provide } = provider
    /* istanbul ignore else*/
    if (this.newAllDeps.has(provide)) {
      this.newAllDeps.delete(provide)
      this.newAllDeps.add(provider)
    }
  }

  private configInjector() {
    const parent = ReflectiveInjector.resolveAndCreate(Array.from((allDeps as any)))
    this.injector = parent.resolveAndCreateChild(Array.from(this.newAllDeps as any))
  }

  private injector: Injector
  getInstance(ins: any) {
    this.configInjector()
    return this.injector.get(ins)
  }
}

export const testbed = new TestBed
