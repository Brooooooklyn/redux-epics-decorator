import React, { useEffect } from 'react'

import { useEffectModule } from '../../../src'
import Module2 from '../module2/module'
import { GlobalState } from '../store'

export function HooksModule2Container() {
  const [{ allMsgs, currentMsgId }, action] = useEffectModule(
    Module2,
    ({ module2 }: GlobalState) => module2,
  )

  useEffect(() => {
    return () => {
      action.dispose()
    }
  }, [])

  const changeMsg = (id: string) => () => action.selectMsg(id)
  const loadMsg = () => action.getMsg()
  const loadFiveMsgs = () => action.loadFiveMsgs()
  const loadMsgs = () => action.loadMsgs()

  const currentMsg = allMsgs.find(({ id }) => id === currentMsgId)

  return (
    <div>
      {currentMsg && <h2> current: {currentMsg.content} </h2>}
      {allMsgs.map(({ id, content }) => (
        <div key={id} data-id={id} onClick={changeMsg(id)}>
          {content}
        </div>
      ))}
      <button id="btn1" onClick={loadMsg}>
        load message
      </button>
      <button id="btn2" onClick={loadFiveMsgs}>
        load message
      </button>
      <button id="btn3" onClick={loadMsgs}>
        load 10 messages
      </button>
    </div>
  )
}
