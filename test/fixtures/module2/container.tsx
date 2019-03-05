import React from 'react'
import { createAction } from 'redux-actions'

import { connect } from '../../../src'
import effectModule2, {
  Module2StateProps,
  Module2DispatchProps,
} from './module'
import { GlobalState } from '../store'

interface OtherDispatchProps {
  otherDispatch: (...args: any[]) => any
}

export type Module2Props = Module2StateProps &
  Module2DispatchProps &
  OtherDispatchProps

const mapStateToProps = ({ module2 }: GlobalState) => module2

export class Module2 extends React.PureComponent<Module2Props> {
  defaultState: any = {}

  private loadMsg = () => {
    this.props.getMsg()
  }

  private loadFiveMsgs = () => {
    this.props.loadFiveMsgs()
  }

  private loadMsgs = () => {
    this.props.loadMsgs()
  }

  componentWillUnmount() {
    this.props.dispose()
  }

  render() {
    const { allMsgs } = this.props
    const messages = allMsgs.map((msg) => (
      <div key={msg.id} data-id={msg.id} onClick={this.changeMsg(msg.id)}>
        {msg.content}
      </div>
    ))

    const currentMsg = allMsgs.find((msg) => msg.id === this.props.currentMsgId)
    const msgNode = currentMsg ? <h2> current: {currentMsg.content} </h2> : null
    return (
      <div>
        {msgNode}
        {messages}
        <button id="btn1" onClick={this.loadMsg}>load message</button>
        <button id="btn2" onClick={this.loadFiveMsgs}>load message</button>
        <button id="btn3" onClick={this.loadMsgs}>load 10 messages</button>
      </div>
    )
  }

  private changeMsg(id: string) {
    return () => this.props.selectMsg(id)
  }
}

export const Module2Container = connect(effectModule2)(mapStateToProps, {
  otherDispatch: createAction('otherDispatch'),
})(Module2)
