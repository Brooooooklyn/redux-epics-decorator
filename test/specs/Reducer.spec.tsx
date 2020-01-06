import { rootInjectableFactory } from '@asuka/di'
import React from 'react'
import * as enzyme from 'enzyme'
import { expect } from 'chai'
import * as Sinon from 'sinon'
import * as SinonChai from 'sinon-chai'
import { Provider } from 'react-redux'

import { EffectModule, Reducer } from '../../src'
import { setupStore } from '../fixtures/store'
import {
  Module1,
  Module1Container,
  Module1Props,
  createActionPayloadCreator,
  createActionMetaCreator,
} from '../fixtures/module1'
import { msgDelay } from '../fixtures/service'

chai.use(SinonChai)

describe('Reducer specs', () => {
  let AppNode: enzyme.ReactWrapper<Module1Props, any>
  let rootNode: enzyme.ReactWrapper
  const store = setupStore()
  const propsSpy = {} as any

  beforeEach(() => {
    rootInjectableFactory.resolveProviders()
    rootNode = enzyme.mount(
      <Provider store={store}>
        <Module1Container {...propsSpy} />
      </Provider>,
    )
    AppNode = rootNode.find(Module1)
  })

  afterEach(() => {
    rootNode.unmount()
    const providers = Array.from(rootInjectableFactory.providers)
    rootInjectableFactory.reset().addProviders(...providers)
  })

  it('should handler directly called action', () => {
    const props = AppNode.props()
    const clock = Sinon.useFakeTimers()
    props.getMsg()
    clock.tick(msgDelay)
    const [msg] = store.getState().module1.allMsgs
    props.selectMsg(msg.id)
    expect(store.getState().module1.currentMsgId).to.equal(msg.id)
  })

  it('should pass extra args to createAction', () => {
    const props = AppNode.props()
    const clock = Sinon.useFakeTimers()

    props.noopReducer()

    clock.tick(msgDelay)

    createActionPayloadCreator.should.have.been.called
    createActionMetaCreator.should.have.been.called

    createActionPayloadCreator.resetHistory()
    createActionMetaCreator.resetHistory()

    clock.restore()
  })

  it('should throw when module without namespace', () => {
    function defineModule() {
      class TestModule extends EffectModule<any> {
        defaultState = { foo: 1 }

        @Reducer()
        foo(state: any) {
          return state
        }
      }

      return new TestModule()
    }

    expect(defineModule).to.throw()
  })
})
