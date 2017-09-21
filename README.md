[![CircleCI](https://circleci.com/gh/Brooooooklyn/redux-epics-decorator.svg?style=svg)](https://circleci.com/gh/Brooooooklyn/redux-epics-decorator)
[![Coverage Status](https://coveralls.io/repos/github/Brooooooklyn/redux-epics-decorator/badge.svg?branch=master)](https://coveralls.io/github/Brooooooklyn/redux-epics-decorator?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/Brooooooklyn/redux-epics-decorator.svg)](https://greenkeeper.io/)
# redux-epics-decorator

A Dumb wrapper for [redux](https://github.com/reactjs/redux) 💚 [redux-observable](https://github.com/redux-observable/redux-observable) 💚 [react-redux](https://github.com/reactjs/react-redux) 💚 [redux-actions](https://github.com/reduxactions/redux-actions)

## Why
Yes, less boilerplate codes.


but which more **important** is:

![record](./assets/record.gif)

## Full example project

[fixtures](./test/fixtures)

Use `yarn && yarn start` to play with it.

## Usage

```ts
// module.ts
import 'rxjs/add/operator/exhaustMap'
import 'rxjs/add/operator/takeUntil'
import { Action } from 'redux-actions'
import { ActionsObservable } from 'redux-observable'
import { Observable } from 'rxjs/Observable'

import { generateMsg, Msg } from '../service'
import { EffectModule, namespace, Effect, Reducer, ModuleActionProps, DefineAction } from 'redux-epics-decorator'

export interface StateProps {
  currentMsgId: string | null
  allMsgs: Msg[]
}

@namespace('yourcomponent')
class Module1 extends EffectModule<StateProps> {
  defaltState: StateProps = {
    currentMsgId: null,
    allMsgs: []
  }

  @DefineAction('dispose') dispose: Observable<Action<void>>

  @Effect('get_msg')({
    success: (state: StateProps, { payload }: Action<Msg>) => {
      const { allMsgs } = state
      return { ...state, allMsgs: allMsgs.concat([payload!]) }
    }
  })
  getMsg(action$: ActionsObservable<Action<void>>) {
    return action$
      .exhaustMap(() => generateMsg()
        .takeUntil(this.dispose)
        .map(this.createAction('success'))
      )
  }

  @Reducer('select_msg')
  selectMsg(state: StateProps, { payload }: Action<string>) {
    return { ...state, currentMsgId: payload }
  }
}

export type DispatchProps = ModuleActionProps<StateProps, Module1>

const moduleOne = new Module1
export default moduleOne
export const reducer = moduleOne.reducer
export const epic = moduleOne.epic
```

```ts
// container.tsx
import module, { StateProps, DispatchProps } from './module'

type Props = StateProps & DispatchProps

class YourComponent extends React.PureComponent<Props> {
  // your codes ...
}

export connect(({ yourcomponent }: GlobalState) => yourcomponent, module)(YourComponent)
```

```ts
// store
import { reducer as yourComponentReducer, epic as yourComponentEpic, StateProps as YourComponentStateProps } from './yourcomponent/module'

interface GlobalState {
  yourcomponent: YourComponentStateProps
}

const rootEpic = combineEpics(
  yourComponentEpic
)


const rootReducer = combineReducers({
  yourcomponent: yourComponentReducer
})

export default store = createStore<GlobalState>(rootReducer, compose<any>(
  applyMiddleware(
    createEpicMiddleware(rootEpic)
  )
))

```

## API

- EffectModule\<T>

    All Your Module must extends EffectModule


    The Generic \<T> is represent for `defaultState`


    - EffectModule#createAction

      shortcut for createAction in `redux-actions`, use it in @Effect decorated method.

    - EffectModule#createActionFrom

      you can `createActionFrom` a @Effect or @Reducer to trigger it.

      like this one: [create action from a @Effect](https://github.com/Brooooooklyn/redux-epics-decorator/blob/dfd15c9ef0dfc7777aa52f63f138546607e69bfe/test/fixtures/module2/module.ts#L52), and this one: [create action from a @Reducer](https://github.com/Brooooooklyn/redux-epics-decorator/blob/dfd15c9ef0dfc7777aa52f63f138546607e69bfe/test/fixtures/module2/module.ts#L65)

    - EffectModule#epic

      Your epic from this module that wish to be combine to rootEpic.

    - EffectModule#reducer

      Your epic from this module that wish to be combine to rootReducer.

- Decorators
    - namespace(name: string)

      use this decorator before another decorators

      ```ts

      interface StateProps {
        foo: number
      }

      @namespace('YourModule')
      class YourModule extends EffectModule<StateProps> {
        defaultState = {
          foo: 1
        }
      }
      ```

      all your actions and reducers would have prefix: `YourModule/`

    - DefineAction

      use this decorator to define a property as Observable, which emmit `Action` when the Action was dispatched.

        ```ts
        interface StateProps {
          foo: number
        }

        @namespace('YourModule')
        class YourModule extends EffectModule<StateProps> {
          defaultState = {
            foo: 1
          }

          // this is same to
          // dispose = action$.ofType('YourModule/dispose')
          @DefineAction('dispose'): dispose: Observable<Action<any>>
        }
        ```
    - Effects(action: string) => (reducerMap?: ReducerMap) => methodDecorator

      accept a action that would fire the epic, return a function that accept a reducerMap.

        ```ts
        interface StateProps {
          foo: number
        }

        @namespace('YourModule')
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
          start(action$: Observable<Action<any>>, store: Store<GlobalState>) {
            // same as actionObservable.ofType('start')
            return action$
              .switchMap(({ payload }) => {
                // your logic here
              })
              // or
              // .map(this.createAction('success'))
              // this would fire success defined up this method
              .map(response => this.createAction('success')(response))
              .catch(this.createAction('error'))
          }
        }
        ```

      you can also createActionFrom another `@Effect` or `@Reducer`


      [create action from a @Effect](https://github.com/Brooooooklyn/redux-epics-decorator/blob/dfd15c9ef0dfc7777aa52f63f138546607e69bfe/test/fixtures/module2/module.ts#L52), [create action from a @Reducer](https://github.com/Brooooooklyn/redux-epics-decorator/blob/dfd15c9ef0dfc7777aa52f63f138546607e69bfe/test/fixtures/module2/module.ts#L65)

    - Reducer(action: string)

      define a reducer

        ```ts
        interface StateProps {
          foo: number
        }

        @namespace('YourModule')
        class YourModule extends EffectModule<StateProps> {
          defaultState = {
            foo: 1
          }

          @Reducer('add')
          add(state: StateProps) {
            const { foo } = state
            return { ...state, foo: foo + 1 }
          }
        }
        ```

    - connect(mapStateToProps: MapStateToProps, module: EffectModule): ConnectedComponent

      - param mapStateToProps is same to which in `react-redux`
      - param module is a module instance

      use it like `connect` in `react-redux`.

      all your methods in `module` that decorated by `@DefineAction` `@Effects` `@Reducer` would be transfer to `Dispatch` and pass to connected Component as a Props.

      Your can use `this.props.start()` to dispatch `yourmodule/start` action.
