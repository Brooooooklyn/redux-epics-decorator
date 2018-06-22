# Writing a EffectModule
EffectModule is the most important abstract level in redux-epics-decorator. It provides most of abilities around redux.

It is a `TypeScript Class` which extend the `EffectModule<T>` base class.

## Initialing with `defaultState`

The Generic `T` in `EffectModule<T>` represent for `defaultState` in your Module. If you are familiar with [redux-actions](https://github.com/redux-utilities/redux-actions), you may know how to combine `reducers` in the `handleActions` way:

```ts
import { createAction, handleActions, Action } from 'redux-actions'

const INCREMENT = createAction<number>('increment')
const DECREMENT = createAction<number>('decrement')

interface StateProps {
  counter: number
}

export const reducer = handleActions({
  [INCREMENT.toString()]: (state: StateProps, { payload }: Action<number>) => {
    return { ...state, counter: state.counter + payload! }
  },
  [DECREMENT.toString()]: (state: StateProps, { payload }: Action<number>) => {
    return { ...state, counter: state.counter - payload! }
  }
}, {
  counter: 0
} // ------> defaultState here)
```

the `defaultState` would be used to set up the initial redux Store. You can read the [Setting Up Root Reducer](./setting-up-middleware.md) to know how the `defaultState` to be combined with Redux Store by `combineModuleReducers`.

And the `defaultState` is a required property which must be initialized in any `EffectModule`.

```ts
// landing.module.ts
import { EffectModule, Module } from 'redux-epics-decorator'

import { UserInfo } from 'schemas'

export interface LandingStateProps {
  user: UserInfo | null
  loading: boolean
}

@Module('landing')
export class LandingModule extends EffectModule<LandingStateProps> {
  readonly defaultState = {
    user: null,
    loading: true,
  }
}
```

## Writing an Effect
An `Effect` is very similiar to an [Epic](https://redux-observable.js.org/docs/basics/Epics.html) in `redux-observable`.

It just a method in `EffectModule<T>` witch take two params `action$: Observable<T>` and optional `state$: StateObservable<GlobalState>`, and decorated by `@Effect`.

The `@Effect` Decorator take an optional reducers map as param.

The action$ is a Observable that take the action payload (yes, no more ofType).

The [StateObservable](https://github.com/redux-observable/redux-observable/blob/master/src/StateObservable.js) was introduced in redux-observable@1.0.0, you can read this [Acessing state](https://github.com/redux-observable/redux-observable/blob/master/MIGRATION.md#accessing-state) doc to know more about how to use it.

```ts
// landing.module.ts
import { Effect, EffectModule, Module } from 'redux-epics-decorator'
import { Observable } from 'rxjs'
import { exhaustMap, map } from 'rxjs/operators'

import { UserInfo } from 'schemas'
import { Users } from 'api/users'

export interface LandingStateProps {
  user: UserInfo | null
  loading: boolean
}

@Module('landing')
export class LoginModule extends EffectModule<LandingStateProps> {
  readonly defaultState = {
    user: null,
    loading: true,
  }

  // dependencies inject
  constructor(private users: Users) {
    super()
  }

  @Effect({
    // reducers map
    success: (state: LoginStateProps, { payload }: UserInfo) => {
      return { ...state, user: payload!, loading: false }
    }
  })
  login(action$: Observable<{ username: string, password: string }>) {
    // equal to -----> action$.pipe(ofType('landing/login'), map(({ payload }) => payload)) in redux-observable
    return action$.pipe(
      exhaustMap(loginInfo => this.users.login(loginInfo)),
      // equal to -----> map(userInfo => ({ type: 'landing/login\success', payload: loginInfo }))
      map(this.createAction('success'))
    )
  }
}
```


## Writing a Reducer
There are two ways to write a `Reducer` in an `EffectModule`.

One is writing it in reducers map of `@Effect` decorator, you can see this way in example of last Section.

The other way is writing a method with `@Reducer` decorator.

The `@Reducer` decorator take an optional `ReducerHandler` as param, whitch shape is:

```typescript
interface ReducerHandler {
  createActionPayloadCreator?: any // payloadCreator in createAction from 'react-actions'
  createActionMetaCreator?: any // metaCreator in createAction from 'react-actions'
}
```

You can read this [doc](https://redux-actions.js.org/api-reference/createaction-s#createactiontype-payloadcreator) to learn more about the `payloadCreator` and `metaCreator`.

> In most cases, you don't need ReducerHandler at all



The reducer method is a normal method in `EffectModule` which take two params, `state: StateProps` and optional `action: Action<T>`.

The type of state is the same to `defaultState`. The `Generic T` in  `Action<T>` is represent `payload`.

If you choose writing a reducer in this way, you are actually expose a `dispatch function` which could be connected to a React Component. We will discuss more details about how `connect` work later.



```typescript
// landing.module.ts
import { Effect, EffectModule, Module, Reducer } from 'redux-epics-decorator'
import { Observable } from 'rxjs'
import { exhaustMap, map } from 'rxjs/operators'

import { UserInfo } from 'schemas'
import { Users } from 'api/users'

export interface LandingStateProps {
  user: UserInfo | null
  loading: boolean
}

@Module('landing')
export class LoginModule extends EffectModule<LandingStateProps> {
  readonly defaultState = {
    user: null,
    loading: true,
  }

  // dependencies inject
  constructor(private users: Users) {
    super()
  }

  @Reducer()
  editUserName(state: LandingStateProps, { payload }: Action<string>) {
	  return { ...state, user: { ...state.user, name: payload! } }
  }

  @Effect({
    // reducers map
    success: (state: LoginStateProps, { payload }: UserInfo) => {
      return { ...state, user: payload!, loading: false }
    }
  })
  login(action$: Observable<{ username: string, password: string }>) {
    // equal to -----> action$.pipe(ofType('landing/login'), map(({ payload }) => payload)) in redux-observable
    return action$.pipe(
      exhaustMap(loginInfo => this.users.login(loginInfo)),
      // equal to -----> map(userInfo => ({ type: 'landing/login\success', payload: loginInfo }))
      map(this.createAction('success'))
    )
  }
}
```



## Writing an action dispatcher without any behavior itself

You may think WTF is this and why we need such things.

In most cases we use these things to cancel all `Epics` that in progress when `componentWillUnmount`. Let's see an example:

```typescript
// landing.module.ts
import { DefineAction, Effect, EffectModule, Module, Reducer } from 'redux-epics-decorator'
import { Observable } from 'rxjs'
import { exhaustMap, map, takeUntil } from 'rxjs/operators'

import { UserInfo } from 'schemas'
import { Users } from 'api/users'

export interface LandingStateProps {
  user: UserInfo | null
  loading: boolean
}

@Module('landing')
export class LoginModule extends EffectModule<LandingStateProps> {
  readonly defaultState = {
    user: null,
    loading: true,
  }
  
  @DefineAction dispose!: Observable<void>

  // dependencies inject
  constructor(private users: Users) {
    super()
  }

  @Reducer()
  editUserName(state: LandingStateProps, { payload }: Action<string>) {
	  return { ...state, user: { ...state.user, name: payload! } }
  }

  @Effect({
    success: (state: LoginStateProps, { payload }: UserInfo) => {
      return { ...state, user: payload!, loading: false }
    }
  })
  login(action$: Observable<{ username: string, password: string }>) {
    return action$.pipe(
      exhaustMap(loginInfo => this.users.login(loginInfo)),
      map(this.createAction('success')),
      takeUntil(this.dispose), // --------------> action$.pipe(ofType('landing/dispose'))
    )
  }
}

// landing.component.tsx
// ...
class LandingComponent extends React.PureComponent {
  componentWillUnmount() {
    this.props.dispose()
  }
}

connect(LandingModule)(mapStateToProps)(LandingComponent)
```





## Writing DispatchProps

`ModuleDispatchProps` is just a TypeScript type which could provide `Go to Definition` and `Type Check` for `Dispatch Props`.



```typescript
// landing.module.ts
import { Effect, EffectModule, Module, ModuleDispatchProps, Reducer } from 'redux-epics-decorator'
import { Observable } from 'rxjs'
import { exhaustMap, map } from 'rxjs/operators'

import { UserInfo } from 'schemas'
import { Users } from 'api/users'

export interface LandingStateProps {
  user: UserInfo | null
  loading: boolean
}

@Module('landing')
export class LoginModule extends EffectModule<LandingStateProps> {
  readonly defaultState = {
    user: null,
    loading: true,
  }

  // dependencies inject
  constructor(private users: Users) {
    super()
  }

  @Reducer()
  editUserName(state: LandingStateProps, { payload }: Action<string>) {
	  return { ...state, user: { ...state.user, name: payload! } }
  }

  @Effect({
    // reducers map
    success: (state: LoginStateProps, { payload }: UserInfo) => {
      return { ...state, user: payload!, loading: false }
    }
  })
  login(action$: Observable<{ username: string, password: string }>) {
    // equal to -----> action$.pipe(ofType('landing/login'), map(({ payload }) => payload)) in redux-observable
    return action$.pipe(
      exhaustMap(loginInfo => this.users.login(loginInfo)),
      // equal to -----> map(userInfo => ({ type: 'landing/login\success', payload: loginInfo }))
      map(this.createAction('success'))
    )
  }
}

export type DispatchProps = ModuleDispatchProps<LoginModule>
```

```typescript
// landing.container.tsx

import * as React from 'react'
import { connect } from 'redux-epics-decorator'

import { LandingStateProps, DispatchProps, LandingModule } from './landing.module'

type LandingProps = LandingStateProps & DispatchProps

/**
 * interface GlobalState { landing: LandingStateProps }
 */
const mapStateToProps = (state: GlobalState) => state.landing

class LandingComponent extends React.PureComponent<LandingProps> {
  render() {
    // dispatch props types
    // props.editUserName(payload: string)
    // props.login(payload: { username: string, password: string })
    // you will have type check in React Components and go to definition ability
    //...
  }
}

export const LandingContainer = connect(LandingModule)(mapStateToProps)(LandingComponent)

```



## Connecting Module and React Component

We provide `connect` function to connect a Module and a React Component.

It is a Higher-order function take a `EffectModule` and return a `connect` function from `react-redux`.



```typescript
// landing.container.tsx

// ...

export const LandingContainer = connect(LandingModule)/** here is connect from 'react-redux' */(mapStateToProps)(LandingComponent)
```

