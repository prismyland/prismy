import { urlSelector, methodSelector, Result, ResponseObject } from '../../src'
import { URL } from 'url'
import { expectType } from '../helpers'
import { Handler } from '../../src/handler'

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
