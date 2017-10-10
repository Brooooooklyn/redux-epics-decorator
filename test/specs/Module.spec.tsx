import React from 'react'
import { Store } from 'redux'
import * as enzyme from 'enzyme'
import { expect } from 'chai'
import * as Sinon from 'sinon'
import * as SinonChai from 'sinon-chai'

import { setupStore, GlobalState } from '../fixtures/store'
import { Module1Container, Module1Props } from '../fixtures/module1'
import { Module3Container, Module3Props } from '../fixtures/module3'
import { msgDelay } from '../fixtures/service'

chai.use(SinonChai)

describe('Module specs', () => {
  let Module1Node: enzyme.ShallowWrapper<Module1Props, any>
  let Module2Node: enzyme.ShallowWrapper<Module3Props, any>
  let store: Store<GlobalState>

  beforeEach(() => {
    store = setupStore()
    Module1Node = enzyme.shallow(<Module1Container store={ store } />)
    Module2Node = enzyme.shallow(<Module3Container { ...{ store } } />)
  })

  afterEach(() => {
    Module1Node.unmount()
    Module2Node.unmount()
  })

  it('should not transfer Action that markAsGlobal', () => {
    const props = Module1Node.props()
    const clock = Sinon.useFakeTimers()
    props.getModule3Msg()
    clock.tick(msgDelay)
    expect(store.getState().module3.allMsgs.length).to.equal(1)

    clock.restore()
  })
})
