import { rootInjector, Type } from '@asuka/di'

export { Injectable } from '@asuka/di'
export const getInstance = <T>(target: Type<T>): T =>
  rootInjector.getInstance(target)
