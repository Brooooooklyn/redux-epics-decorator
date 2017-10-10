import React from 'react'
import { bindActionCreators } from 'redux'
import { connect, Dispatch } from 'react-redux'

import { Module3StateProps, Module3DispatchProps, getMsg, dispose } from './module'
import { GlobalState } from '../store'

export type Module3Props = Module3StateProps & Module3DispatchProps

const mapStateToProps = ({ module3 }: GlobalState) => module3
const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
  getMsg,
  dispose,
}, dispatch)

class Module3 extends React.PureComponent<Module3Props> {

  private loadMsg = () => {
    this.props.getMsg()
  }

  componentWillUnmount() {
    this.props.dispose()
  }

  render() {
    const { allMsgs } = this.props
    const messages = allMsgs
      .map(msg => (
        <div key={ msg.id }>
          { msg.content }
        </div>
      ))

    return (
      <div>
        { messages }
        <button onClick={ this.loadMsg }>module 3 load message</button>
      </div>
    )
  }

}

export const Module3Container = connect(mapStateToProps, mapDispatchToProps)(Module3)
