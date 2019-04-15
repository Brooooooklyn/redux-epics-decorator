import { expect } from 'chai'
import { Store } from 'redux'
import * as SinonChai from 'sinon-chai'
import React from 'react'
import * as enzyme from 'enzyme'
import { Provider } from 'react-redux'

import { setupStore, GlobalState } from '../fixtures/store'
import { Module4Container, Module4, Module4Props } from '../fixtures/module4'
import { Injectable, Inject, getInstance, Module } from '../../src'

chai.use(SinonChai)

describe('Injectable Spec', () => {
  const EngineProviderToken = Symbol('EngineProviderToken')

  const EngienProvider = {
    provide: EngineProviderToken,
    useValue: () => 1122,
  }

  @Injectable()
  class Api {
    getData() {
      return 1729
    }
  }

  @Module({
    name: 'bar',
    providers: [EngienProvider],
  })
  class Bar {
    constructor(
      public api: Api,
      @Inject(EngineProviderToken) public engine: Function,
    ) {}
  }

  function configureInvalidModule() {
    @Module({
      name: 'Invalid',
      providers: 'haha' as any,
    })
    class Invalid {}
    return Invalid
  }

  @Module({
    name: 'foo',
    providers: [],
  })
  class Foo {
    f() {
      return 1
    }
    static x = 123
  }

  let rootNode: enzyme.ReactWrapper
  let appNode: enzyme.ReactWrapper<Module4Props, any>
  let store: Store<GlobalState>
  const props = {} as any
  beforeEach(() => {
    store = setupStore()
    rootNode = enzyme.mount(
      <Provider store={store}>
        <Module4Container {...props} />
      </Provider>
    )

    appNode = rootNode.find(Module4)
  })
  afterEach(() => {
    rootNode.unmount()
  })

  it('Module decorator should not change source class', () => {
    expect(Foo.x).equal(123)
    const foo = new Foo()
    expect(foo.f()).equal(1)
  })

  it('Module decorator should work (react container)', () => {
    appNode.props().add()
    appNode.props().add()
    expect(store.getState().module4.count).equal(2)
    appNode.props().setData()
    expect(store.getState().module4.count).equal(1729)
  })

  it('Injectable decorator should work', () => {
    const bar = getInstance(Bar)
    expect(bar.api.getData()).equal(1729)
  })

  it('Injecrt decorator should work', () => {
    const bar = getInstance(Bar)
    expect(bar.engine()).to.equal(1122)
  })

  it('Providers invalid should throw', () => {
    expect(configureInvalidModule).to.throw()
  })
})
