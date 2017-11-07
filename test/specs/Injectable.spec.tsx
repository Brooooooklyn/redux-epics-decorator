import { expect } from 'chai'
import { Store } from 'redux'
import * as SinonChai from 'sinon-chai'
import React from 'react'
import * as enzyme from 'enzyme'

import { setupStore, GlobalState } from '../fixtures/store'
import { Module4Container, Module4Props } from '../fixtures/module4'
import { module } from '../../src/decorators/module'

chai.use(SinonChai)

describe('Injectable Spec', () => {

  @module('foo')
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

  it('Injectable decorator should not change source class', () => {
    expect(Foo.x).equal(123)
    const foo = new Foo
    expect(foo.f()).equal(1)
  })

  it('Injectable decorator shoudle work (react container)', () => {
    AppNode.props().add()
    AppNode.props().add()
    expect(store.getState().module4.count).equal(2)
    AppNode.props().setData()
    expect(store.getState().module4.count).equal(1729)
  })

})
