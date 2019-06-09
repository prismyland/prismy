import { IncomingMessage, ServerResponse } from 'http'
import { BaseResult } from './BaseResult'

export interface RedirectResultOptions {
  statusCode?: number
  headers?: [string, number | string | string[]][]
}

export class RedirectResult extends BaseResult {
  statusCode: number
  headers: [string, number | string | string[]][]

  constructor(public location: string, options?: RedirectResultOptions) {
    super()
    const { statusCode, headers } = { statusCode: 302, headers: [], ...options }
    this.statusCode = statusCode
    this.headers = headers
  }

  execute(req: IncomingMessage, res: ServerResponse) {
    this.headers.forEach(([key, value]) => {
      res.setHeader(key, value)
    })

    res.statusCode = this.statusCode
    res.setHeader('Location', this.location)
    res.end()
  }
}
