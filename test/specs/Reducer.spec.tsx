import React from 'react'
import * as enzyme from 'enzyme'
import { expect } from 'chai'
import * as Sinon from 'sinon'
import * as SinonChai from 'sinon-chai'

import { EffectModule, Reducer } from '../../src'
import { setupStore } from '../fixtures/store'
import { Module1Container, Module1Props } from '../fixtures/module1'
import { msgDelay } from '../fixtures/service'

chai.use(SinonChai)

describe('Reducer specs', () => {
  let AppNode: enzyme.ShallowWrapper<Module1Props, any>
  const store = setupStore()

  beforeEach(() => {
    AppNode = enzyme.shallow(<Module1Container store={ store } />)
  })

  afterEach(() => {
    AppNode.unmount()
  })

  it('should handler directly called action', () => {
    const props = AppNode.props()
    const clock = Sinon.useFakeTimers()
    props.getMsg()
    clock.tick(msgDelay)
    const [ msg ] = store.getState().module1.allMsgs
    props.selectMsg(msg.id)
    expect(store.getState().module1.currentMsgId).to.equal(msg.id)
  })

  it('should throw when module without namespace', () => {
    function defineModule() {
      class TestModule extends EffectModule<any> {
        defaultState = { foo: 1 }

        @Reducer('foo')
        foo(state: any) {
          return state
        }
      }

      return new TestModule
    }

    expect(defineModule).to.throw()
  })
})
