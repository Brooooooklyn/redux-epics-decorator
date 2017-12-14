import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'

// declare const process: {
  // env: {
    // [index: string]: string
  // }
// }

let i = 0

export interface Msg {
  id: string
  content: string
}

export const CancelController = {
  cancelToken: () => {
    // if (process.env.NODE_ENV !== 'test') {
      // console.info('Cancel happen')
    // }
  }
}

export const msgDelay = 1500

export function generateMsg(): Observable<Msg> {
  return Observable.create((observer: Observer<Msg>) => {
    const timer = setTimeout(() => {
      observer.next({
        id: `${ i++ }`,
        content: 'msg content' + i
      })
      observer.complete()
    }, msgDelay)

    return () => {
      clearTimeout(timer)
      CancelController.cancelToken()
    }
  })
}
