import React from 'react'

import { connect } from '../../../src'
import effectModule2, { Module2StateProps, Module2DispatchProps } from './module'
import { GlobalState } from '../store'

export type Module2Props = Module2StateProps & Module2DispatchProps

const mapStateToProps = ({ module2 }: GlobalState) => module2

class Module2 extends React.PureComponent<Module2Props> {

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
    const messages = allMsgs
      .map(msg => (
        <div key={ msg.id } onClick={ this.changeMsg(msg.id) }>
          { msg.content }
        </div>
      ))

    const currentMsg = allMsgs.find(msg => msg.id === this.props.currentMsgId)
    const msgNode = currentMsg ? <h2> current: { currentMsg.content } </h2> : null
    return (
      <div>
        { msgNode }
        { messages }
        <button onClick={ this.loadMsg }>load message</button>
        <button onClick={ this.loadFiveMsgs }>load message</button>
        <button onClick={ this.loadMsgs }>load 10 messages</button>
      </div>
    )
  }

  private changeMsg(id: string) {
    return () => this.props.selectMsg(id)
  }
}

export const Module2Container = connect(effectModule2 as any)(mapStateToProps, {})(Module2)
