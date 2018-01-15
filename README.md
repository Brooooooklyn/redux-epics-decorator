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
import { Observable } from 'rxjs/Observable'
import { exhaustMap } 'rxjs/operators/exhaustMap'
import { map } 'rxjs/operators/map'
import { takeUntil } 'rxjs/operators/takeUntil'
import { withLatestFrom } 'rxjs/operators/withLatestFrom'

import { generateMsg, Msg } from '../service'
import { EffectModule, namespace, Effect, ModuleActionProps } from 'redux-epics-decorator'

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

  @Effect()
  dispose(current$: Observable<void>) {
    return current$
  }

  @Effect()
  getMsg(current$: Observable<void>, { state$ }) {
    return action$.pipe(
      exhaustMap(() => generateMsg().pipe(
        takeUntil(this.dispose),
        withLatestFrom(state$, (msg, state: StateProps) => this.createAction(
          'get_msg',
          { allMsgs: state.allMsgs.concat(msg) }
        ))
      ))
    )
  }

  @Effect()
  selectMsg(current$: Observable<string>) {
    return current$
      .map((currentMsgId: string) => this.createAction('msg', { currentMsgId }))
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

      createAction(type: string, payload?: Partial<StateProps>, metaCreator?: Function)

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

    - Effect() => methodDecorator

      accept a action that would fire actions

        ```ts
        interface StateProps {
          foo: number[]
        }

        @namespace('YourModule')
        class YourModule extends EffectModule<StateProps> {
          defaultState = {
            foo: [1]
          }

          @Effect()
          start(current$: Observable<any>, { state$, action$ }) {
            // same as actionObservable.ofType('start')
            return current$
              .switchMap(({ payload }) => {
                // your logic here
              })
              // or
              // .map((data) => this.createAction('success', { data }))
              // this would fire success defined by this method
              .withLatestFrom(state$, (foo, state) => this.createAction('success', {
                foo: state.foo.concat(foo)
              }))
              .catch((e) => this.createAction('error', e))
          }
        }
        ```

      you can createActionFrom another `@Effect`

      [create action from a @Effect](https://github.com/Brooooooklyn/redux-epics-decorator/blob/536b5e2adb8e7398c3542288eafccebca5861d4d/test/fixtures/module2/module.ts#L69)

    - connect(mapStateToProps: MapStateToProps, module: EffectModule): ConnectedComponent

      - param mapStateToProps is same to which in `react-redux`
      - param module is a module instance

      use it like `connect` in `react-redux`.

      all your methods in `module` that decorated by `@Effect` would be transfer to `Dispatch` and pass to connected Component as a Props.

      Your can use `this.props.start()` to dispatch `yourmodule/start` action.
