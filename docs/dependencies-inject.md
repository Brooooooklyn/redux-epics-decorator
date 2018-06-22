# Module is injectable
Yes, any `EffectModule` which is decorated by `@Module` is injectable, you can inject it to another `@Injectable` class or another `@Module`.



# Using @Injectable decroator

This is a cool tool which is borrowed from `Angular` echo system. Here are some real world examples for it:



```typescript
// apis/http.ts
import { Injectable } from 'redux-epics-decorator'
import Axios, { AxiosRequestConfig } from 'axios'

interface BackendOption extends AxiosRequestConfig {
  query?: Object
}

@Injectable()
export class Http {
  private cancelText = 'Request canceled by the user.'

  private apiHost = '/api'

  private defaultOptions = {
    method: 'GET',
    headers: {
      withCredentials: true,
    },
  }

  constructor() {
    axios.defaults.headers.post['Content-Type'] = 'text/plain'
  }

  private create<T = {}>(options: AxiosRequestConfig): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      const source = axios.CancelToken.source()
      const traceId = Math.floor(16 ** 16 * Math.random()).toString(16)
      axios
        .request({
          baseURL: this.apiHost,
          ...this.defaultOptions,
          cancelToken: source.token,
          ...{
            headers: { 'x-b3-traceid': traceId },
          },
          ...options,
        })
        .then((response) => {
          let resp: T
          try {
            resp = JSON.parse(response.data)
          } catch (e) {
            resp = response.data
          }
          observer.next(resp)
          observer.complete()
        })
        .catch((error) => {
          const data = (error.response && error.response.data) || {}
          observer.error(
            this.apiErrorMaps[data.code] ||
              this.apiErrorMaps[data.message] ||
              error
          )
        })

      return () => source.cancel(this.cancelText)
    })
  }

  private createMethod = (method: string) => <T = {}>(
    url: string,
    options?: Partial<BackendOption>
  ) => {
    return this.create<T>({
      url,
      method,
      params: options ? options.query : {},
      ...(omit(options, 'query') as AxiosRequestConfig),
    }).pipe(map((r: any) => r.data)) as Observable<T>
  }

  get = this.createMethod('GET')

  put = this.createMethod('PUT')

  post = this.createMethod('POST')

  delete = this.createMethod('DELETE')
}
```

```typescript
// apis/users.ts
import { Injectable } from 'redux-epics-decorator'

import { Http } from './http'
import { LoginInfo, UserInfo } from '~/schemas'

@Injectable()
export class Users {
  constructor(private http: Http) { }
  
  login(info: LoginInfo) {
    return this.http.post<UserInfo>('v2/login', {
      data: info
    })
  }
}
```

```typescript
// apis/books.ts
import { Injectable } from 'redux-epics-decorator'

import { Http } from './http'
import { Book } from '~/schemas'

@Injectable()
export class Books {
  constructor(private http: Http) { }
  
  getByUser(userId: string) {
    return this.http.get<Book[]>('v2/login', {
      query: { userId }
    })
  }
}
```



# Injecting functions

In some cases, you may want inject a function to `EffectModule` which have side effect and you want stub it in unit test.

```typescript
// utils/get-image-info.ts
import { Observable, Observer } from 'rxjs'

export interface ImageInfo {
  width: number
  height: number
}

export function getImageInfo(imageUrl: string): Observable<ImageInfo>

export function getImageInfo(imageUrl: string) {
  return Observable.create((observer: Observer<ImageInfo>) => {
    const image = new Image()
    image.onload = () => {
      observer.next({
        width: image.width,
        height: image.height,
      })
      observer.complete()
    }
    image.onerror = (e) => {
      observer.error(e)
    }
    image.src = imageUrl
    
    return () => image.src = null
  })
}

export const GetImageInfoToken = Symbol('getImageInfo')

export const getImageInfoProvider = {
  provide: GetImageInfoToken,
  useValue: getImageInfo,
}
```

```typescript
// landing.module.ts
// ...
import { Inject, EffectModule } from 'redux-epics-decorator'
import { getImageInfo, getImageInfoProvider, GetImageInfoToken } from '~/utils/get-image-info'

// ...

@Module({
  name: 'landing',
  providers: [getImageInfoProvider]
})
export class LandingModule extends EffectModule<LandingStateProps> {
  constructor(@Inject(GetImageInfoToken) private getImageInfo: typeof getImageInfo) {
    super()
  }
}
```



# Read https://angular.io/guide/dependency-injection for more informations

