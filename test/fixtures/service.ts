import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'

let i = 0

export interface Msg {
  id: string
  content: string
}

export const CancelController = {
  cancelToken: () => {
    return 'cancel_token'
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
