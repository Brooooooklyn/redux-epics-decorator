# Setting Up Root Reducer

## With existed `reducers`

```ts
// reducers.ts
import { combineModuleReducers } from 'redux-epics-decorator'

// existed reducers
import { reducer as module1Reducer, Moudle1StateProps } from 'module1'
import { reducer as module2Reducer, Moudle2StateProps } from 'module2'
import { reducer as module3Reducer, Moudle3StateProps } from 'module3'

// EffectModules
import { Module4, Moudle4StateProps } from 'module4'
import { Module5, Moudle5StateProps } from 'module5'
import { Module6, Moudle6StateProps } from 'module6'

export interface GlobalState {
  module1: Moudle1StateProps,
  module2: Moudle2StateProps,
  module3: Moudle3StateProps,
  module4: Moudle4StateProps,
  module5: Moudle5StateProps,
  module6: Moudle6StateProps,
}

export const rootReducer = {
  module1: module1Reducer,
  module2: module2Reducer,
  module3: module3Reducer,
  ...combineModuleReducers({
    module4: Module4,
    module5: Module5,
    module6: Module6,
  }),
}
```

## Without existed `reducers`

```ts
// reducers.ts
import { combineModuleReducers } from 'redux-epics-decorator'

import { Module1, Module1StateProps } from 'module1'
import { Module2, Module2StateProps } from 'module2'
import { Module3, Module3StateProps } from 'module3'

export interface GlobalState {
  module1: Module1StateProps,
  module2: Module2StateProps,
  module3: Module3StateProps,
}

export const rootReducer = combineModuleReducers({
  module1: Module1,
  module2: Module2,
  module3: Module3,
})
```

# Setting Up Root Epics

## With existed `redux-observable`

```ts
// epics.ts
import { combineModuleEpics } from 'redux-epics-decorator'

// existed epics
import { epic as module1Epic } from 'Module1'
import { epic as module2Epic } from 'Module2'
import { epic as module3Epic } from 'Module3'

// EffectModules
import { Module4 } from 'Module4'
import { Module5 } from 'Module5'
import { Module6 } from 'Module6'

export const rootEpic = combineEpics(
  module1Epic,
  module2Epic,
  module3Epic,
  combineModuleEpics(
    Module4,
    Module5,
    Module6,
  )
)
```

## Without existed `redux-observable`

> If you are not familar with `redux-observable`, you should read [Epics](https://github.com/redux-observable/redux-observable/blob/master/docs/basics/Epics.md) at least

```ts
// epics.ts
import { combineModuleEpics } from 'redux-epics-decorator'

import { Module1 } from 'Module1'
import { Module2 } from 'Module2'
import { Module3 } from 'Module3'

export const rootEpic = combineModuleEpics(
  Module1,
  Module2,
  Module3,
)
```

# Setting Up Epic Middleware

```ts
import { createStore, applyMiddleware, Store } from 'redux'
import { createEpicMiddleware, combineModuleEpics } from 'redux-epics-decorator'

import { rootEpic } from './epics'
import { rootReducer, GlobalState } from './reducers'

const epicMiddleware = createEpicMiddleware()

const store: Store<GlobalState> = createStore(
  rootReducer,
  applyMiddleware(epicMiddleware),
)

epicMiddleware.run(rootEpic)

export { GlobalState } from './reducers'
```
