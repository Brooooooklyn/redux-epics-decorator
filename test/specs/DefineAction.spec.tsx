import React from 'react'
import * as enzyme from 'enzyme'
import { expect } from 'chai'
import { Observable, Subscription, Scheduler } from 'rxjs'
import observableSymbol from 'symbol-observable'
import { range } from 'lodash'
import * as Sinon from 'sinon'
import * as SinonChai from 'sinon-chai'

import { EffectModule, DefineAction } from '../../src'
import { setupStore } from '../fixtures/store'
import { Module1Container, Module1Props } from '../fixtures/module1'
import module1 from '../fixtures/module1/module'
import module2 from '../fixtures/module2/module'

chai.use(SinonChai)

describe('DefineAction specs', () => {
  let AppNode: enzyme.ShallowWrapper<Module1Props, any>
  let subscription: Subscription | undefined

  beforeEach(() => {
    AppNode = enzyme.shallow(<Module1Container store={ setupStore() } />)
  })

  afterEach(() => {
    AppNode.unmount()
    if (subscription) {
      subscription.unsubscribe()
    }
  })

  it('should define as Observable', () => {
    expect(module1.dispose).to.be.instanceof(Observable)
    expect(module1.dispose[observableSymbol]).to.not.be.null
    expect(module2.dispose).to.be.instanceof(Observable)
    expect(module2.dispose[observableSymbol]).to.not.be.null
  })

  it('should emit action when action was called', done => {
    const props = AppNode.props()

    const action = {
      type: 'one/dispose'
    }

    subscription = module1.dispose.take(1)
      .subscribe(a => {
        expect(a).to.deep.equal(action)
        done()
      })

    props.dispose()
  })

  it('should emit multiple value', done => {
    const props = AppNode.props()

    const spy = Sinon.spy()

    const action = {
      type: 'one/dispose'
    }

    const callCount = 5

    const signal$ = module1.dispose
      .share()

    signal$.subscribe(spy)

    signal$.take(callCount)
      .observeOn(Scheduler.async)
      .take(callCount)
      .subscribe((a) => {
        expect(a).to.deep.equal(action)
      }, void 0, () => {
        expect(spy.callCount).to.equal(callCount)
        done()
      })

    range(callCount).forEach(() => props.dispose())
  })

  it('should throw when module without namespace', () => {
    function defineModule() {
      class TestModule extends EffectModule<any> {
        @DefineAction('foo') foo: any
        defaultState = { foo: 1 }
      }

      return new TestModule
    }

    expect(defineModule).to.throw()
  })
})
