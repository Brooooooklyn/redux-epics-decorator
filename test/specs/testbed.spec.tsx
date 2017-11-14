import { expect } from 'chai'

import { Injectable, Module } from '../../src'
import { testbed } from '../../src/testbed'
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

  testbed.configureTestingModule({
    providers: [{
      provide: Api,
      useClass: MockApi,
    }]
  })

  it('TestBed should mock DI', () => {
    expect(testbed.getInstance(Foo).api.getData()).equal(1729)
  })
})
