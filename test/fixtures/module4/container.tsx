import React from 'react'

import { connect } from '../../../src'
import effectModule4, {
  Module4StateProps,
  Module4DispatchProps,
} from './module'
import { GlobalState } from '../store'

export type Module4OwnProps = {
  test: 'foo'
}
export type Module4Props = Module4StateProps &
  Module4DispatchProps &
  Module4OwnProps

export const mapStateToProps = ({ module4 }: GlobalState) => module4

export class Module4 extends React.PureComponent<Module4Props> {
  render() {
    return (
      <div>
        {this.props.count}
        <button onClick={this.props.add} />
      </div>
    )
  }
}

export const Module4Container = connect(effectModule4)(mapStateToProps, () => ({
  test: 'foo' as 'foo',
}))(Module4)
