import { IncomingMessage, ServerResponse } from 'http'
import { send } from 'micro'
import { BaseResult } from './BaseResult'

export class SendResult extends BaseResult {
  constructor(
    public statusCode: number,
    public data?: any,
    public headers?: [string, number | string | string[]][]
  ) {
    super()
  }

  execute(req: IncomingMessage, res: ServerResponse) {
    if (this.headers != null) {
      this.headers.forEach(([key, value]) => {
        res.setHeader(key, value)
      })
    }
    send(res, this.statusCode, this.data)
  }
}
