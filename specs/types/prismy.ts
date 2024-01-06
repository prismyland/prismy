import {
  prismy,
  urlSelector,
  methodSelector,
  res,
  ResponseObject,
} from '../../src'
import { URL } from 'url'
import { expectType } from '../helpers'
import { PrismySelector } from '../../src/selectors/createSelector'

const asyncUrlSelector: PrismySelector<URL> = urlSelector

const handler1 = prismy(
  [urlSelector, methodSelector, asyncUrlSelector],
  (url, method, url2) => {
    expectType<URL>(url)
    expectType<string | undefined>(method)
    expectType<URL>(url2)
    return res('')
  },
)

expectType<
  (
    url: URL,
    method: string | undefined,
    url2: URL,
  ) => ResponseObject<any> | Promise<ResponseObject<any>>
>(handler1.handler)
