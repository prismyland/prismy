import {
  middleware,
  urlSelector,
  methodSelector,
  ResponseObject,
  prismy,
  res,
} from '../../src'
import { URL } from 'url'
import { expectType } from '../helpers'
import { PrismySelector } from '../../src/selectors/createSelector'

const asyncUrlSelector: PrismySelector<URL> = urlSelector

const middleware1 = middleware(
  [urlSelector, methodSelector, asyncUrlSelector],
  (next) => async (url, method, url2) => {
    expectType<URL>(url)
    expectType<string | undefined>(method)
    expectType<URL>(url2)
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
