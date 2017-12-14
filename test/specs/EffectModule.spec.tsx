import React from 'react'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import * as enzyme from 'enzyme'
import { expect } from 'chai'
import * as Sinon from 'sinon'
import * as SinonChai from 'sinon-chai'
import { Route } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'

import { setupStore, GlobalState, history } from '../fixtures/store'
import EffectModule1, { Module1Container, Module1Props, Module1 } from '../fixtures/module1'
import { Module3Container } from '../fixtures/module3'
import { Module4Container, Module4, Module4Props } from '../fixtures/module4'
import { msgDelay } from '../fixtures/service'
import { getAction } from '../../src'

chai.use(SinonChai)

describe('Module specs', () => {
  let AppNode: enzyme.ReactWrapper<any, any>
  let Module1Node: enzyme.ReactWrapper<Module1Props, any>
  let Module4Node: enzyme.ReactWrapper<Module4Props>
  let store: Store<GlobalState>

  beforeEach(() => {
    store = setupStore()
    const App = (
      <Provider store={ store }>
        <ConnectedRouter history={ history }>
          <div>
            <Route exact path='/' component={ Module1Container } />
            <Route path='/hmmm' component={ Module3Container } />
            <Module4Container />
          </div>
        </ConnectedRouter>
      </Provider>
    )
    AppNode = enzyme.mount(App)
    Module1Node = AppNode.find(Module1) as enzyme.ReactWrapper<Module1Props>
    Module4Node = AppNode.find(Module4)
  })

  afterEach(() => {
    AppNode.unmount()
  })

  it('should not transfer Action that markAsGlobal', () => {
    const props = Module1Node.props()
    const clock = Sinon.useFakeTimers()
    props.getModule3Msg()
    clock.tick(msgDelay)
    expect(store.getState().module3.allMsgs.length).to.equal(1)

    clock.restore()
  })

  it('should warn when markAsGlobal', () => {
    const props = Module1Node.props()
    const spy = Sinon.spy(console, 'warn')
    const clock = Sinon.useFakeTimers()

    props.getModule3Msg()
    clock.tick(msgDelay)
    expect(spy.callCount).to.equal(1)

    spy.restore()
    clock.restore()
  })

  it('should not transfer react-router-redux actions', () => {
    const props = Module1Node.props()
    props.changeRouter()

    expect(store.getState().router.location!.pathname).to.equal('/hmmm')
  })

  it('should getAction from Module class with decorated method name', () => {
    expect(`${getAction(EffectModule1, 'getMsg')}`).to.equal('module1/get_msg')
  })

  it('should createActionFrom the other module', () => {
    const props = Module4Node.props()
    props.dispatchOtherModulesAction()
    const globalState = store.getState()
    expect(globalState.depModule4.counter).to.equal(2)
  })

})
