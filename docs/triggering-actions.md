# Triggering another Effect/Reducer/DefineAction

You may have some situations that need to trigger another `Action` in a redux cycle.

With `redux-observable` you may write such codes to do that:

```typescript
import { createAction } from 'redux-actions'
import { combineEpics, ofType, StateObservable } from 'redux-observable'
import { Observable } from 'rxjs'
import { map, exhaustMap, endWith, switchMap, withLatestFrom } from 'rxjs/operators'

import { Users } from '~/apis/users'
import { Books } from '~/apis/books'
import { Book, LoginInfo, UserInfo } from '~/schemas'
import { GlobalState } from '~/store'

const LOGIN_ACTION = createAction<LoginInfo>('landing/login')
const LOGIN_SUCCESS = createAction<UserInfo>('landing/loginSuccess')
const GET_USER_BOOKS = createAction<void>('landing/getUserBooks')
const GET_USER_BOOKS_SUCCESS = createAction<void>('landing/getUserBooksSuccess')

export interface LandingStateProps {
  user: UserInfo | null
  books: Book[]
}

export reducer = handleActions<LandingStateProps>({
  [LOGIN_SUCCESS.toString()]: (state: LandingStateProps, { payload }: Action<UserInfo>) => {
    return { ...state, user: payload! }
  },
  [GET_USER_BOOKS_SUCCESS.toString()]: (state: LandingStateProps, { payload }: Action<Bookp[]>) => {
    return { ...state, books: payload! }      
  }
}, {
  user: null,
  books: [],
})

const loginEpic = (action$: Observable<LoginInfo>) =>
  action$.pipe(
    ofType(LOGIN_ACTION),
    exhaustMap(({ payload }: LoginInfo) => Users.login(payload)),
    map(LOGIN_SUCCESS),
    endWith(GET_USERS_BOOKS()),
  )

const getUserBooksEpic = (action$: Observable<void>, state$: StateObservable<GlobalState>) =>
  action$.pipe(
    ofType(GET_USER_BOOKS),
    withLatestFrom(state$),
    switchMap(([_, state]) => {
      const { id } = state.landing.user    
      return Books.getByUser(id)
    }),
    map(GET_USER_BOOKS_SUCCESS)
  )

export const epic = combineEpics(loginEpic, getUserBooksEpic)
```



In loginEpic, we triggered `LOGIN_SUCCESS` and `GET_USERS_BOOKS` after login ajax complete.

As we saw in [writing a module](./writing-a-module.md) section, we could use `this.createAction('REUDCER_NAME')` to trigger a reducer which was defined in `@Effect` param. But how could we trigger an `@Recucer` or another `@Effect` ? Here is `EffectModule#createActionFrom` method:



```typescript
import { EffectModule, Module, Effect, Reducer, StateObservable } from 'redux-epics-decorator'
import { Observable } from 'rxjs'
import { map, exhaustMap, endWith, switchMap, withLatestFrom } from 'rxjs/operators'

import { Users } from '~/apis/users'
import { Books } from '~/apis/books'
import { Book, LoginInfo, UserInfo } from '~/schemas'
import { GlobalState } from '~/store'

export interface LandingStateProps {
  user: UserInfo | null
  books: Book[]
}

export class LandingModule extends EffectModule<LandingStateProps> {
  readonly defaultState = {
    user: null,
    books: []
  }
  
  constructor(private users: Users, private books: Books) {
    super()
  }
  
  @Effect({
    success: (state: LandingStateProps, { payload }: Action<UserInfo>) => {
      return { ...state, user: payload! }
    }
  })
  login(action$: Observable<LoginInfo>) {
    return action$.pipe(
      exhaustMap(loginInfo => this.users.login(loginInfo)),
      map(this.createAction('success')),
      endWith(this.createActionFrom(this.getUserBooks)()) // --------> trigger another Effect here
    )
  }
  
  @Effect({
    success: (state: LandingStateProps, { payload }: Action<Book[]>) => {
      return { ...state, books: payload! }
    }
  })
  getUserBooks(action$: Observable<void>, state$: StateObservable<GlobalState>) {
    return action$.pipe(
      withLatestFrom(state$),
      switchMap(([_, state]) => {
        const { id } = state.landing.user
        return this.books.getByUser(id)
      }),
      map(this.createAction('success'))
    )
  }
}
```



##Triggering actions in another Module

You can event trigger Effect from another `Module`:

```typescript
import { EffectModule, Module, Effect, Reducer } from 'redux-epics-decorator'
import { Observable } from 'rxjs'
import { map, exhaustMap, endWith } from 'rxjs/operators'

import { Users } from '~/apis/users'
import { LoginInfo, UserInfo } from '~/schemas'
import { GlobalState } from '~/store'
import { BookListsModule } from '~/booklists/booklists.module'

export interface LandingStateProps {
  user: UserInfo | null
}

export class LandingModule extends EffectModule<LandingStateProps> {
  readonly defaultState = {
    user: null,
  }
  
  constructor(private users: Users, private booklists: BookListsModule) {
    super()
  }
  
  @Effect({
    success: (state: LandingStateProps, { payload }: Action<UserInfo>) => {
      return { ...state, user: payload! }
    }
  })
  login(action$: Observable<LoginInfo>) {
    return action$.pipe(
      exhaustMap(loginInfo => this.users.login(loginInfo)),
      map(this.createAction('success')),
      endWith(this.createActionFrom(this.booklists.getUserBooks)()) // --------> trigger Effect which belong to BookListsModule
    )
  }
}
```



# Triggering normal redux actions

If you have a existed redux system in your project, you may want to communicate to them in `EffectModule`. And we have `EffectModule#markAsGlobal` to do that:



```typescript
import { createAction } from 'redux-actions'
import { EffectModule, Module, Effect, Reducer } from 'redux-epics-decorator'
import { Observable } from 'rxjs'
import { map, exhaustMap, endWith } from 'rxjs/operators'

import { Users } from '~/apis/users'
import { LoginInfo, UserInfo } from '~/schemas'
import { GlobalState } from '~/store'

export interface LandingStateProps {
  user: UserInfo | null
}

export class LandingModule extends EffectModule<LandingStateProps> {
  readonly defaultState = {
    user: null,
  }
  
  constructor(private users: Users) {
    super()
  }
  
  @Effect({
    success: (state: LandingStateProps, { payload }: Action<UserInfo>) => {
      return { ...state, user: payload! }
    }
  })
  login(action$: Observable<LoginInfo>) {
    return action$.pipe(
      exhaustMap(loginInfo => this.users.login(loginInfo)),
      map(this.createAction('success')),
      endWith(this.markAsGlobal(createAction('notification')({
        status: 'success',
        info: 'Login Success'
      }))) // ----------> this is same to store.dispatch({ type: 'notification', payload: { status: 'success', info: 'Login Success' }})
    )
  }
}
```

# Triggering actions in EffectModule outside

If you want to trigger `@Effect` or `@Reducer` or `@DefineAction` in `EffectModule`, you can use `getAction` function outside :

```typescript
import { getAction } from 'redux-epics-decorator'

// LandingModule Class
import { LandingModule } from '~/modules/landing'

getAction(LandingModule, 'login') // ---------> 'landing/login'
```

