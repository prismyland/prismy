import { SendResult, SendResultOptions } from './results/SendResult'
import { Selector } from './createInjectDecorators'
import { IncomingMessage, ServerResponse } from 'http'
import { sendError } from 'micro'

export class BaseHandler {
  context?: {
    req: IncomingMessage
    res: ServerResponse
  }

  send<D = any>(data?: D, options?: SendResultOptions) {
    return new SendResult(data, options)
  }

  select<P>(selector: Selector<P>): P {
    const { req, res } = this.context!

    return selector(req, res)
  }

  onError(req: IncomingMessage, res: ServerResponse, error: any): any {
    return sendError(req, res, error)
  }
}
