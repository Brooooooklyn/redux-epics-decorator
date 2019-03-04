import React from 'react'

import { useEffectModule } from '../../../src'
import { Module1 } from '../module1/module'
import { GlobalState } from '../store'

export function HooksModule1Container() {
  const [{ allMsgs, currentMsgId }, action] = useEffectModule(
    Module1,
    ({ module1 }: GlobalState) => module1,
  )
  const selectMsg = (id: string) => () => action.selectMsg(id)
  const loadMsg = () => action.getMsg()

  const currentMsg = allMsgs.find(({ id }) => id === currentMsgId)

  return (
    <div id="module1">
      {currentMsg && <h2> current: {currentMsg.content} </h2>}
      {allMsgs.map(({ id, content }) => (
        <div key={id} data-id={id} onClick={selectMsg(id)}>
          {content}
        </div>
      ))}
      <button onClick={loadMsg}>load message</button>
    </div>
  )
}
