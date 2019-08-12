import {
  prismy,
  prismyx,
  urlSelector,
  methodSelector,
  res,
  AsyncSelector,
  ResponseObject
} from '../src'
import { expectType } from 'tsd'
import { UrlWithStringQuery } from 'url'

const asyncUrlSelector: AsyncSelector<UrlWithStringQuery> = async context =>
  urlSelector(context)

const handler = prismy(
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
>(handler.handler)

const handler2 = prismyx<
  [UrlWithStringQuery, string | undefined, UrlWithStringQuery]
>([urlSelector, methodSelector, asyncUrlSelector], (url, method, url2) => {
  expectType<UrlWithStringQuery>(url)
  expectType<string | undefined>(method)
  expectType<UrlWithStringQuery>(url2)
  return res('')
})

expectType<
  (
    url: UrlWithStringQuery,
    method: string | undefined,
    url2: UrlWithStringQuery
  ) => ResponseObject<any> | Promise<ResponseObject<any>>
>(handler2.handler)
