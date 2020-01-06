import { rootInjectableFactory, Type } from '@asuka/di'

export { Injectable } from '@asuka/di'
export const getInstance = <T>(target: Type<T>): T =>
  rootInjectableFactory.getInstance(target)
