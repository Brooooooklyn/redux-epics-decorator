import { expect } from 'chai'
import { Store } from 'redux'
import * as SinonChai from 'sinon-chai'
import React from 'react'
import * as enzyme from 'enzyme'

import { setupStore, GlobalState } from '../fixtures/store'
import { Module4Container, Module4Props } from '../fixtures/module4'
import { Module, getInstance } from '../../src/decorators/Module'
import { Injectable } from '../../src'

chai.use(SinonChai)

describe('Injectable Spec', () => {

  @Injectable()
  class Api {
    getData() {
      return 1729
    }
  }

  @Module('bar')
  class Bar {
    constructor(public api: Api) {}
  }

  @Module('foo')
  class Foo {
    f() {
      return 1
    }
    static x = 123
  }

  let AppNode: enzyme.ShallowWrapper<Module4Props, any>
  let store: Store<GlobalState>
  const props = {} as any
  beforeEach(() => {
    store = setupStore()
    AppNode = enzyme.shallow(<Module4Container store={ store } { ...props } />)
  })
  afterEach(() => {
    AppNode.unmount()
  })

  it('Module decorator should not change source class', () => {
    expect(Foo.x).equal(123)
    const foo = new Foo
    expect(foo.f()).equal(1)
  })

  it('Module decorator should work (react container)', () => {
    AppNode.props().add()
    AppNode.props().add()
    expect(store.getState().module4.count).equal(2)
    AppNode.props().setData()
    expect(store.getState().module4.count).equal(1729)
  })

  it('Injectable decorator should work', () => {
    const bar = getInstance(Bar)
    expect(bar.api.getData()).equal(1729)
  })

})
