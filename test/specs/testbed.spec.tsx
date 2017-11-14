import { expect } from 'chai'

import { Injectable, Module } from '../../src'
import { TestBed } from '../../src/testbed'
import MockApi from '../fixtures/Api'

describe('TestBed spec', () => {
  @Injectable()
  class Api {
    getData() {
      return 2147
    }
  }

  @Module('foo')
  class Foo {
    constructor(public api: Api) {}
  }

  const testBed = new TestBed()
  testBed.configureTestingModule({
    providers: [{
      provide: Api,
      useClass: MockApi,
    }]
  })

  it('TestBed should mock DI', () => {
    expect(testBed.getInstance(Foo).api.getData()).equal(1729)
  })
})
