import {
  prismy,
  urlSelector,
  methodSelector,
  res,
  AsyncSelector,
  ResponseObject
} from '../../src'
import { UrlWithStringQuery } from 'url'
import { expectType } from '../helpers'

const asyncUrlSelector: AsyncSelector<UrlWithStringQuery> = async context =>
  urlSelector(context)

const handler1 = prismy(
  [urlSelector, methodSelector, asyncUrlSelector],
  (url, method, url2) => {
    expectType<UrlWithStringQuery>(url)
    expectType<string | undefined>(method)
    expectType<UrlWithStringQuery>(url2)
    return res('')
  }
)

expectType<
  (
    url: UrlWithStringQuery,
    method: string | undefined,
    url2: UrlWithStringQuery
  ) => ResponseObject<any> | Promise<ResponseObject<any>>
>(handler1.handler)
