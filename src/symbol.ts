export const symbolNamespace = Symbol('namespace')
export const symbolDispatch = Symbol('dispatch')
export const symbolReducerMap = Symbol('reducerMap')
export const symbolEpics = Symbol('actionQueue')
export const symbolAction = Symbol('action')
export const symbolNotTrasfer = Symbol('notTrasnfer')

const namespaceSplit = '/'
const subReducerSplit = '_'

export const withNamespace = (namespace: string, name: string) => `${ namespace }${ namespaceSplit }${ name }`
export const withReducer = (namespace: string, name: string, reducerName: string) =>
  `${ withNamespace(namespace, name) }${ subReducerSplit }${ reducerName }`
