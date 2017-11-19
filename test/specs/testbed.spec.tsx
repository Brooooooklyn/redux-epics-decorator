import { expect } from 'chai'
import { Store } from 'redux'
import * as Sinon from 'sinon'
import * as SinonChai from 'sinon-chai'
import React from 'react'
import * as enzyme from 'enzyme'

import { GlobalState } from '../fixtures/store'
import Module4Component, { mapStateToProps } from '../fixtures/module4/container'
import DepModule4 from '../fixtures/module4/depModule'
import Module4, { Module4Props } from '../fixtures/module4'
import { Injectable, connect } from '../../src'
import { TestBedFactory } from '../../src/testbed'

chai.use(SinonChai)

describe('TestBed spec', () => {

  @Injectable()
  class MockDepModule4 {
    getData() {
      return 1234
    }
  }

  let AppNode: enzyme.ShallowWrapper<Module4Props, any>
  let store: Store<GlobalState>
  let testbed
  const props = {} as any
  beforeEach(() => {
    testbed = TestBedFactory.configureTestingModule({
      providers: [{
        provide: DepModule4,
        useClass: MockDepModule4
      }]
    })
    const Module4Container = testbed.connect(Module4)(mapStateToProps)(Module4Component)
    store = testbed.setupStore('module4', Module4)
    AppNode = enzyme.shallow(<Module4Container store={ store } { ...props } />)
  })

  afterEach(() => {
    AppNode.unmount()
  })

  it('should configure empty TestBed', () => {
    testbed = TestBedFactory.configureTestingModule()
    const depModule = testbed.getInstance(DepModule4)
    const stub = Sinon.stub(depModule, 'getData')
    stub.returns(123)
    store = testbed.setupStore('module4', Module4)

    const Container = connect(Module4)(mapStateToProps)(Module4Component)
    AppNode = enzyme.shallow(<Container store={ store } { ...props } />)
    AppNode.props().setData()
    expect(store.getState().module4.count).equal(123)
    expect(stub.callCount).to.equal(1)
    stub.restore()
  })

  it('should configure TestBed', () => {
    AppNode.props().setData()
    expect(store.getState().module4.count).equal(1234)
  })
})
