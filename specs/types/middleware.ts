import {
  Middleware,
  urlSelector,
  methodSelector,
  ResponseObject,
  prismy,
  res,
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
    url2: URL,
  ) => ResponseObject<any> | Promise<ResponseObject<any>>
>(middleware1.mhandler)

expectType<
  (
    next: () => Promise<ResponseObject<any>>,
  ) => (
    url: URL,
    method: string | undefined,
    url2: URL,
  ) => ResponseObject<any> | Promise<ResponseObject<any>>
>(middleware1.mhandler)

prismy([], () => res(''), [middleware1])
