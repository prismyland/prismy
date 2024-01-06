import {
  prismy,
  urlSelector,
  methodSelector,
  res,
  ResponseObject,
} from '../../src'
import { URL } from 'url'
import { expectType } from '../helpers'

const handler1 = prismy([urlSelector, methodSelector], (url, method) => {
  expectType<URL>(url)
  expectType<string | undefined>(method)
  return res('')
})

expectType<
  (
    url: URL,
    method: string | undefined,
    url2: URL,
  ) => ResponseObject<any> | Promise<ResponseObject<any>>
>(handler1.handler)
