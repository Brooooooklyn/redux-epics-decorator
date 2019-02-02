[![CircleCI](https://circleci.com/gh/LeetCode-OpenSource/redux-epics-decorator.svg?style=svg)](https://circleci.com/gh/LeetCode-OpenSource/redux-epics-decorator)
[![Coverage Status](https://coveralls.io/repos/github/LeetCode-OpenSource/redux-epics-decorator/badge.svg?branch=master)](https://coveralls.io/github/LeetCode-OpenSource/redux-epics-decorator?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/LeetCode-OpenSource/redux-epics-decorator.svg)](https://greenkeeper.io/)
# redux-epics-decorator

A Dumb wrapper for [redux](https://github.com/reactjs/redux) 💚 [redux-observable](https://github.com/redux-observable/redux-observable) 💚 [react-redux](https://github.com/reactjs/react-redux) 💚 [redux-actions](https://github.com/reduxactions/redux-actions) 💚 [injection-js](https://github.com/mgechev/injection-js)

## Features

- 🚀 Less boilerplate codes
- 🦄 No magic string `Action Types`
- 💚 Type Safe, typecheck in **Payload**
- ⛏ Go to definition, go to your Reducer/Epics with **one** click
- 🖇 Easy to intergrate into existed redux-observable or other redux middlewares

but which more **important** is:

![record](./assets/record.gif)

## Dependeicies

- `yarn add redux redux-observable rxjs redux-actions react-redux`
- `yarn add redux-epics-decorator`

## Full example project

[fixtures](./test/fixtures)

Use `yarn && yarn start` to play with it.

## Usage

```ts
// module.ts
import { Action } from 'redux-actions'
import { ActionsObservable } from 'redux-observable'
import { Observable } from 'rxjs'
import { exhaustMap, takeUntil } from 'rxjs/operators'

import { generateMsg, Msg } from '../service'
import { EffectModule, Module, Effect, Reducer, ModuleActionProps, DefineAction } from 'redux-epics-decorator'

export interface StateProps {
  currentMsgId: string | null
  allMsgs: Msg[]
}

@Module('your_module_name')
export class Module1 extends EffectModule<StateProps> {
  readonly defaltState: StateProps = {
    currentMsgId: null,
    allMsgs: []
  }

  @DefineAction('dispose') dispose: Observable<void>

  @Effect({
    success: (state: StateProps, { payload }: Action<Msg>) => {
      const { allMsgs } = state
      return { ...state, allMsgs: allMsgs.concat([payload!]) }
    }
  })
  getMsg(action$: Observable<void>) {
    return action$.pipe(
      exhaustMap(() => generateMsg().pipe(
        takeUntil(this.dispose),
        map(this.createAction('success')), // up in Effect Decorator
        // dispatch a normal Redux Action
        // intergrate to your existed redux system
        endWith(this.markAsGlobal({
          type: 'notification',
          payload: {
            type: 'success',
            msg: '✨ Get message success!'
          }
        })),
      ))
    )
  }

  @Reducer('select_msg')
  selectMsg(state: StateProps, { payload }: Action<string>) {
    return { ...state, currentMsgId: payload }
  }
}

export type DispatchProps = ModuleActionProps<Module1>
```

```ts
// container.tsx
import { Module1, StateProps, DispatchProps } from './module'

interface OtherProps {
  price: number
  count: number
}
type Props = StateProps & OtherProps & DispatchProps

const mapStateToProps = (state: GlobalState): StateProps => ({
  ...state.yourcomponent,
  price: otherModule.price,
  count: otherModule.count,
})

class YourComponent extends React.PureComponent<Props> {
  // your codes ...

  render() {
    // this is same to this.props.dispatch({ type: 'Module1/getMsg' })
    this.props.getMsg() // () => Action<void>, type safe here
    return (
      <div />
    )
  }
}

export connect(Module1)(mapStateToProps)(YourComponent)
```

```ts
// store
import { combineModuleEpics, combineModuleReducers, createEpicMiddleware } from 'redux-epics-decorator'

import { StateProps as YourComponentStateProps, Module1 } from './yourcomponent/module'

interface GlobalState {
  yourcomponent: YourComponentStateProps
}

const rootEpic = combineEpics(
  combineModuleEpics(
    Module1,
    Module2,
    Module3,
  ),
  // other normal epics from redux-observable
  epic1,
  epic2,
  epic3,
)


const rootReducer = combineReducers({
  ...combineModuleReducers({
    module1: Module1,
    module2: Module2,
    module3: Module3,
  }),
  // other normal reducers from redux-actions
  other1: otherReducers1,
  other2: otherReducers2,
})

const epicMiddleware = createEpicMiddleware()

export default store = createStore<GlobalState>(rootReducer, compose<any>(
  applyMiddleware(
    epicMiddleware
  )
))

epicMiddleware.run(rootEpic)
```

## Docs and Recipe
Please read [Docs and recipe](./docs)
