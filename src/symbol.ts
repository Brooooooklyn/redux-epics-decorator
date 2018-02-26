export const symbolNamespace = Symbol('namespace')
export const symbolDispatch = Symbol('dispatch')
export const symbolReducerMap = Symbol('reducerMap')
export const symbolEpics = Symbol('actionQueue')
export const symbolAction = Symbol('action')
export const symbolNotTrasfer = Symbol('notTrasnfer')
export const symbolEffectAction = Symbol('EffectAction')
export const symbolEffectActionStream = Symbol('EffectActionStream')
export const routerActionNamespace = '@@router'

const namespaceSplit = '/'
const methodSplit = '-'
const subReducerSplit = '_'

// getMsg -> get_msg
const formatName = (name: string) => {
  return name.replace(/([A-Z])/g, `${ subReducerSplit }$1`).toLowerCase()
}

export const withNamespace = (namespace: string, method: string) => `${ namespace }${ namespaceSplit }${ formatName(method) }`
export const withReducer = (namespace: string, method: string, reducerName: string) =>
  `${ withNamespace(namespace, method) }${ methodSplit }${ formatName(reducerName) }`

export const forkActionType = (namespace: string, method: string, actionType: string) =>
  namespace + namespaceSplit + formatName(method) + actionType.substr(actionType.indexOf(methodSplit))
