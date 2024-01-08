import {
  Middleware,
  urlSelector,
  methodSelector,
  ResponseObject,
  prismy,
  Result,
} from '../../src'
import { URL } from 'url'
import { expectType } from '../helpers'

const middleware1 = Middleware(
  [urlSelector, methodSelector],
  (next) => async (url, method) => {
    expectType<URL>(url)
    expectType<string | undefined>(method)
    return next()
  },
)

expectType<
  (
    next: () => Promise<ResponseObject<any>>,
  ) => (
    url: URL,
    method: string | undefined,
  ) => ResponseObject<any> | Promise<ResponseObject<any>>
>(middleware1.handler)

expectType<
  (
    next: () => Promise<ResponseObject<any>>,
  ) => (
    url: URL,
    method: string | undefined,
  ) => ResponseObject<any> | Promise<ResponseObject<any>>
>(middleware1.handler)

prismy([], () => Result(''), [middleware1])
