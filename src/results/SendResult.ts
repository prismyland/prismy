import { send } from 'micro'
import { BaseResult } from './BaseResult'
import { Context } from '../types'

export interface SendResultOptions {
  statusCode?: number
  headers?: [string, number | string | string[]][]
}

export class SendResult<D = any> extends BaseResult {
  statusCode: number
  headers: [string, number | string | string[]][]

  constructor(public data?: D, options?: SendResultOptions) {
    super()
    const { statusCode, headers } = { statusCode: 200, headers: [], ...options }
    this.statusCode = statusCode
    this.headers = headers
  }

  handle({ res }: Context) {
    this.headers.forEach(([key, value]) => {
      res.setHeader(key, value)
    })

    send(res, this.statusCode, this.data)
  }
}
