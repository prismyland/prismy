import { SendResult } from './SendResult'
import { Selector } from './createInjectDecorators'
import { IncomingMessage, ServerResponse } from 'http'
import { sendError } from 'micro'

export class BaseHandler {
  context?: {
    req: IncomingMessage
    res: ServerResponse
  }

  send(
    statusCode: number,
    data?: any,
    headers?: [string, number | string | string[]][]
  ) {
    return new SendResult(statusCode, data, headers)
  }

  select<P>(selector: Selector<P>): P {
    const { req, res } = this.context!

    return selector(req, res)
  }

  onError(req: IncomingMessage, res: ServerResponse, error: any): any {
    return sendError(req, res, error)
  }
}
