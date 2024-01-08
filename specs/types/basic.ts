import {
  BodySelector,
  Handler,
  methodSelector,
  Middleware,
  prismy,
  PrismyHandler,
  PrismyNextFunction,
  ResponseObject,
  Result,
  urlSelector,
} from '../../src'
import { expectType } from '../helpers'
import http from 'http'

const handler1 = Handler([urlSelector, methodSelector], (url, method) => {
  expectType<URL>(url)
  expectType<string | undefined>(method)
  return Result('')
})

expectType<
  (
    url: URL,
    method: string | undefined,
    url2: URL,
  ) => ResponseObject<any> | Promise<ResponseObject<any>>
>(handler1.handler)

expectType<PrismyHandler>(Handler([BodySelector()], () => Result(null)))

http.createServer(prismy(handler1))

// @ts-expect-error
Handler([BodySelector], () => Result(null))

const middleware1 = Middleware(
  [urlSelector, methodSelector],
  (next) => async (url, method) => {
    expectType<URL>(url)
    expectType<string | undefined>(method)
    return next()
  },
)

expectType<
  (next: PrismyNextFunction) => (url: URL, method: string | undefined) => any
>(middleware1.handler)

// @ts-expect-error
Middleware([BodySelector], () => () => Result(null))

http.createServer(prismy([], () => Result(''), [middleware1]))
