import { Action, createAction, handleActions } from 'redux-actions'
import { ActionsObservable, ofType } from 'redux-observable'
import { map, exhaustMap, takeUntil } from 'rxjs/operators'

import { generateMsg, Msg } from '../service'

export interface Module3StateProps {
  allMsgs: Msg[]
}

export const dispose = createAction('three_dispose')
export const getMsg = createAction('three_get_msg')
const getMsgFinish = createAction<Msg>('three_get_msg_finish')

export interface Module3DispatchProps {
  dispose: typeof dispose
  getMsg: typeof getMsg
}

export const reducer = handleActions(
  {
    [`${getMsgFinish}`](state: Module3StateProps, { payload }: Action<Msg>) {
      const { allMsgs } = state
      return { ...state, allMsgs: [...allMsgs, payload!] }
    },
  },
  {
    allMsgs: [] as Msg[],
  },
)

export const epic = (action$: ActionsObservable<Action<void>>) =>
  action$.pipe(
    ofType(`${getMsg}`),
    exhaustMap(() =>
      generateMsg().pipe(takeUntil(action$.ofType(`${dispose}`))),
    ),
    map(getMsgFinish),
  )
