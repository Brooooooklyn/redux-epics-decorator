import { expect } from 'chai'
import { Store } from 'redux'
import * as Sinon from 'sinon'
import * as SinonChai from 'sinon-chai'
import React from 'react'
import * as enzyme from 'enzyme'
import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operators/map'

import { GlobalState } from '../fixtures/store'
import { Module4 as Module4Component, mapStateToProps } from '../fixtures/module4/container'
import DepModule4 from '../fixtures/module4/depModule'
import Module4, { Module4Props } from '../fixtures/module4'
import { Module, connect, Reducer, Effect, EffectModule } from '../../src'
import { TestBedFactory, TestBed } from '../../src/testbed'

chai.use(SinonChai)

describe('TestBed spec', () => {

  @Module('mock_module_4')
  class MockDepModule4 extends EffectModule<{}> {

    defaultState = { }

    getData() {
      return 1234
    }

    @Reducer()
    exposedReducer(state: any) {
      return state
    }

    @Effect()
    exposedEpic(action$: Observable<void>) {
      return action$.pipe(
        map(() => ({
          type: 'yeah'
        }))
      )
    }
  }

  @Module('mock_module_4')
  class MockDepModule4WithoutDecorator extends EffectModule<{}> {

    defaultState = { }

    getData() {
      return 1234
    }

    exposedReducer() {
      return 1
    }

    exposedEpic() {
      return 2
    }
  }

  let AppNode: enzyme.ShallowWrapper<Module4Props, any>
  let store: Store<GlobalState>
  let testbed: TestBed
  const props = {} as any
  beforeEach(() => {
    testbed = TestBedFactory.configureTestingModule({
      providers: [{
        provide: DepModule4,
        useClass: MockDepModule4
      }]
    })
    const Module4Container = testbed.connect(Module4)(mapStateToProps)(Module4Component)
    store = testbed.setupStore({
      module4: Module4
    })
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
    store = testbed.setupStore({
      module4: Module4
    })

    const Container = connect(Module4)(mapStateToProps)(Module4Component)
    AppNode = enzyme.shallow(<Container store={ store } { ...props } />)
    AppNode.props().setData()
    expect(store.getState().module4.count).equal(123)
    expect(stub.callCount).to.equal(1)
    stub.restore()
  })

  it('should configure empty store', () => {
    testbed = TestBedFactory.configureTestingModule()
    store = testbed.setupStore()

    expect(store.getState()).to.deep.equal({})
  })

  it('should configure TestBed', () => {
    AppNode.props().setData()
    expect(store.getState().module4.count).equal(1234)
  })

  it('should catch epics error', () => {
    const spy = Sinon.spy(console, 'error')

    AppNode.props().errorEpic()
    expect(spy.callCount).to.equal(1)

    spy.restore()
  })

  it('should throw when provider non-decorated method', () => {
    testbed = TestBedFactory.configureTestingModule({
      providers: [{
        provide: DepModule4,
        useClass: MockDepModule4WithoutDecorator
      }]
    })
    testbed.connect(Module4)(mapStateToProps)(Module4Component)

    function fn() {
      store = testbed.setupStore({
        module4: Module4
      })
    }

    expect(fn).to.throw('Could not createActionFrom a non-decoratored method')
  })
})
