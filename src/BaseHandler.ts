import { IncomingMessage, ServerResponse } from 'http'
import { SendResult, SendResultOptions } from './results/SendResult'
import { RedirectResultOptions, RedirectResult } from './results/RedirectResult'
import { Selector, CacheMap } from './createInjectDecorators'

export class BaseHandler {
  context?: {
    req: IncomingMessage
    res: ServerResponse
    cacheMap: CacheMap
  }

  send<D = any>(data?: D, options?: SendResultOptions) {
    return new SendResult(data, options)
  }

  redirect(location: string, options?: RedirectResultOptions) {
    return new RedirectResult(location, options)
  }

  select<P>(selector: Selector<P>): P {
    const { req, res, cacheMap } = this.context!

    return selector(req, res, cacheMap)
  }

  onError(req: IncomingMessage, res: ServerResponse, error: any): any {
    throw error
  }
}
