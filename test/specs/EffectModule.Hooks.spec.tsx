import React from 'react'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import { create, act } from 'react-test-renderer'
import { expect } from 'chai'
import * as Sinon from 'sinon'
import * as SinonChai from 'sinon-chai'

import { setupStore, GlobalState } from '../fixtures/store'
import { msgDelay } from '../fixtures/service'
import { HooksModule1Container } from '../fixtures/hooks'
import { Module1Container } from '../fixtures/module1'

chai.use(SinonChai)

const App = ({
  children,
  store,
}: {
  children: React.ReactNode
  store: Store<GlobalState>
}) => <Provider store={store}>{children}</Provider>

describe('EffectModule Hooks specs', () => {
  const containers = [HooksModule1Container, Module1Container]

  containers.forEach((Container) => {
    const store = setupStore()
    const testRenderer = create(
      <App store={store}>
        <Container />
      </App>,
    )

    it(`Hooks behaves the same as Class way. #${Container.name}`, () => {
      const clock = Sinon.useFakeTimers()

      act(() => {
        testRenderer.root.findByType('button').props.onClick()
      })
      clock.tick(msgDelay)
      expect(store.getState().module1.allMsgs.length).to.equal(1)

      const firstMsg = store.getState().module1.allMsgs[0]

      act(() => {
        testRenderer.root.findByProps({ 'data-id': firstMsg.id }).props.onClick()
      })
      expect(store.getState().module1.currentMsgId).to.equal(firstMsg.id)

      clock.restore()
    })
  })
})
