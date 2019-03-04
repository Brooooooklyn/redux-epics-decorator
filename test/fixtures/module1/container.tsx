import React from 'react'

import { connect } from '../../../src'
import effectModule1, {
  Module1StateProps,
  Module1DispatchProps,
} from './module'
import { GlobalState } from '../store'

export type Module1Props = Module1StateProps & Module1DispatchProps

const mapStateToProps = ({ module1 }: GlobalState) => module1

export class Module1 extends React.PureComponent<Module1Props> {
  private loadMsg = () => {
    this.props.getMsg()
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
      <div id="module1">
        {msgNode}
        {messages}
        <button onClick={this.loadMsg}>load message</button>
      </div>
    )
  }

  private changeMsg(id: string) {
    return () => this.props.selectMsg(id)
  }
}

export const Module1Container = connect(effectModule1)(mapStateToProps)(Module1)
