[![CircleCI](https://circleci.com/gh/Brooooooklyn/redux-epics-decorator.svg?style=svg)](https://circleci.com/gh/Brooooooklyn/redux-epics-decorator)
[![Coverage Status](https://coveralls.io/repos/github/Brooooooklyn/redux-epics-decorator/badge.svg?branch=master)](https://coveralls.io/github/Brooooooklyn/redux-epics-decorator?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/Brooooooklyn/redux-epics-decorator.svg)](https://greenkeeper.io/)
# redux-epics-decorator

A Dumb wrapper for [redux](https://github.com/reactjs/redux) 💚 [redux-observable](https://github.com/redux-observable/redux-observable) 💚 [react-redux](https://github.com/reactjs/react-redux) 💚 [redux-actions](https://github.com/reduxactions/redux-actions) 💚 [injection-js](https://github.com/mgechev/injection-js)

## Why
Yes, less boilerplate codes.


but which more **important** is:

![record](./assets/record.gif)

## Dependeicies

- `yarn add redux redux-observable@next rxjs redux-actions react-redux`
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
        map(this.createAction('success')), // up in decorator
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
    this.props.getMsg() // () => Action<void>, type safe here
    return (
      <div />
    )
  }
}

export connect(Module)(mapStateToProps)(YourComponent)
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

## API

- EffectModule\<T>

    All Your Module must extends EffectModule


    The Generic \<T> is represent for `defaultState`


    - EffectModule#createAction

      shortcut for createAction in `redux-actions`, use it in @Effect decorated method.

    - EffectModule#createActionFrom

      you can `createActionFrom` a @Effect or @Reducer to trigger it.

      like this one: [create action from a @Effect](./test/fixtures/module2/module.ts#L67), and this one: [create action from a @Reducer](./test/fixtures/module2/module.ts#L84)

- Decorators
    - Module(nameOrMeta: string | { name: string, providers?: ProvideObject[] })

      > for more documents about `ProvideObject`, you could visit https://angular.io/guide/dependency-injection#the-provide-object-literal

      ```ts

      interface StateProps {
        foo: number
      }

      @Module('YourModule')
      class YourModule extends EffectModule<StateProps> {
        defaultState = {
          foo: 1
        }
      }
      ```

      all of your redux actions in this module would have prefix: `YourModule/`

    - DefineAction

      use this decorator to define a property as Observable, which emmit `Action` when the Action was dispatched.

        ```ts
        interface StateProps {
          foo: number
        }

        @Module('YourModule')
        class YourModule extends EffectModule<StateProps> {
          defaultState = {
            foo: 1
          }

          // you might approach such things in redux-observable by:
          // dispose = action$.ofType('YourModule/dispose')
          @DefineAction('dispose'): dispose: Observable<void>
        }
        ```
    - Effects(reducerMap?: ReducerMap) => methodDecorator

      accept a action that would fire the epic, return a function that accept a reducerMap.

        ```ts
        interface StateProps {
          foo: number
        }

        @Module('YourModule')
        class YourModule extends EffectModule<StateProps> {
          defaultState = {
            foo: 1
          }

          @Effects('start')({
            // reducers here
            success: (state: StateProps, { payload }: Action<number>) => {
              return { ...state, foo: payload! }
            },
            error: (state: StateProps, { payload }: Action<any>) => {
              // ...
            }
          })
          start(action$: Observable<PayloadType>, store: Store<GlobalState>) {
            // same as actionObservable.ofType('start')
            return action$.pipe(
              switchMap(({ payload }) => {
                // your logic here
              }),
              // or
              // map(this.createAction('success'))
              // this would fire success defined up this method
              map(response => this.createAction('success')(response)),
              catchError(this.createAction('error')),
            )
          }
        }
        ```

      you can also createActionFrom another `@Effect` or `@Reducer`

    - Reducer()

      define a reducer

        ```ts
        interface StateProps {
          foo: number
        }

        @Module('YourModule')
        class YourModule extends EffectModule<StateProps> {
          defaultState = {
            foo: 1
          }

          @Reducer()
          add(state: StateProps) {
            const { foo } = state
            return { ...state, foo: foo + 1 }
          }
        }
        ```

- connect: (module: EffectModule) => (mapStateToProps?: MapStateToProps, mapDispatchToProps?: MapDispatchToProps) => (component: React.ComponentClass<Props> | React.StatelessComponent<Props>) => WrappedComponent

  - param module is a EffectModule SubClass
  - param mapStateToProps is same to which in `react-redux`
  - param mapDispatchToProps is same to which in `react-redux`

  use it like `connect` in `react-redux`.

  all your methods in `module` that decorated by `@DefineAction` `@Effects` `@Reducer` would be transfer to `Dispatch` and pass to connected Component as a Props.

  Your can use `this.props.start()` to dispatch `yourmodule/start` action.
