import React from 'react'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import { create, act, ReactTestRenderer } from 'react-test-renderer'
import { expect } from 'chai'
import * as Sinon from 'sinon'
import * as SinonChai from 'sinon-chai'

import { setupStore, GlobalState } from '../fixtures/store'
import { msgDelay } from '../fixtures/service'
import { HooksModule1Container, HooksModule2Container } from '../fixtures/hooks'
import { Module1Container } from '../fixtures/module1'
import { Module2Container } from '../fixtures/module2'
import { rootInjectableFactory } from '@asuka/di'

chai.use(SinonChai)

function getTestRenderer(
  store: Store<GlobalState>,
  Children: React.ComponentClass | React.FunctionComponent,
) {
  return create(
    <Provider store={store}>
      <Children />
    </Provider>,
  )
}

describe('EffectModule Hooks specs', () => {
  describe('module1', () => {
    const containers = [HooksModule1Container, Module1Container]
    let store: Store<GlobalState>
    let testRenderer: ReactTestRenderer

    beforeEach(() => {
      const Container = containers.pop()!
      rootInjectableFactory.resolveProviders()
      store = setupStore()
      testRenderer = getTestRenderer(store, Container)
    })

    afterEach(() => {
      const providers = Array.from(rootInjectableFactory.providers)
      rootInjectableFactory.reset().addProviders(...providers)
    })

    containers.forEach((Container) => {
      it(`Hooks behaves the same as Class way. #${Container.name}`, () => {
        const clock = Sinon.useFakeTimers()

        act(() => {
          testRenderer.root.findByType('button').props.onClick()
        })
        clock.tick(msgDelay)
        expect(store.getState().module1.allMsgs.length).to.equal(1)

        const firstMsg = store.getState().module1.allMsgs[0]

        act(() => {
          testRenderer.root
            .findByProps({ 'data-id': firstMsg.id })
            .props.onClick()
        })
        expect(store.getState().module1.currentMsgId).to.equal(firstMsg.id)

        clock.restore()
      })
    })
  })

  describe('module2', () => {
    const containers = [HooksModule2Container, Module2Container]
    let store: Store<GlobalState>
    let testRenderer: ReactTestRenderer

    beforeEach(() => {
      const Container = containers.pop()!
      store = setupStore()
      testRenderer = getTestRenderer(store, Container)
    })

    containers.forEach((Container) => {
      it(`teardown logic work properly #${Container.name}`, () => {
        const clock = Sinon.useFakeTimers()

        act(() => {
          testRenderer.root.findByProps({ id: 'btn1' }).props.onClick()
        })
        clock.tick(msgDelay)

        expect(store.getState().module2.allMsgs.length).to.equal(1)

        act(() => {
          testRenderer.root.findByProps({ id: 'btn2' }).props.onClick()
        })
        clock.tick(msgDelay / 2)

        act(() => {
          testRenderer.unmount()
        })
        clock.tick(msgDelay / 2)

        expect(store.getState().module2.allMsgs.length).to.equal(1)

        clock.restore()
      })
    })
  })
})
