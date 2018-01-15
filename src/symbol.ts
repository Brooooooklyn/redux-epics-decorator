export const symbolNamespace = Symbol('namespace')
export const symbolDispatch = Symbol('dispatch')
export const symbolEpics = Symbol('actionQueue')
export const symbolAction = Symbol('action')
export const symbolNotTrasfer = Symbol('notTrasnfer')
export const routerActionNamespace = '@@router'

const namespaceSplit = '/'
const subReducerSplit = '_'

// getMsg -> get_msg
const formatName = (name: string) => {
  return name.replace(/([A-Z])/g, '_$1').toLowerCase()
}

export const withNamespace = (namespace: string, name: string) => `${ namespace }${ namespaceSplit }${ formatName(name) }`
export const withReducer = (namespace: string, name: string, reducerName: string) =>
  `${ withNamespace(namespace, name) }${ subReducerSplit }${ formatName(reducerName) }`
