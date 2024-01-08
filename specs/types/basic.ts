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

// @ts-expect-error
expectError(Handler([BodySelector], () => Result(null)))

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

prismy([], () => Result(''), [middleware1])
