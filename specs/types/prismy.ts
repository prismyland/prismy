import {
  prismy,
  urlSelector,
  methodSelector,
  res,
  AsyncSelector,
  ResponseObject,
} from '../../src'
import { URL } from 'url'
import { expectType } from '../helpers'

const asyncUrlSelector: AsyncSelector<URL> = async () => urlSelector()

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
