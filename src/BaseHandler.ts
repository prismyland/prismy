import { IncomingMessage, ServerResponse } from 'http'
import { sendError } from 'micro'
import { SendResult, SendResultOptions } from './results/SendResult'
import { RedirectResultOptions, RedirectResult } from './results/RedirectResult'
import { Selector } from './createInjectDecorators'

export class BaseHandler {
  context?: {
    req: IncomingMessage
    res: ServerResponse
  }

  send<D = any>(data?: D, options?: SendResultOptions) {
    return new SendResult(data, options)
  }

  redirect(location: string, options?: RedirectResultOptions) {
    console.log(location)
    return new RedirectResult(location, options)
  }

  select<P>(selector: Selector<P>): P {
    const { req, res } = this.context!

    return selector(req, res)
  }

  onError(req: IncomingMessage, res: ServerResponse, error: any): any {
    return sendError(req, res, error)
  }
}
