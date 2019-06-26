import { SendResult, SendResultOptions } from './results/SendResult'
import { RedirectResultOptions, RedirectResult } from './results/RedirectResult'
import { Selector } from './types'
import { Context } from './types'

export class BaseHandler {
  context?: Context

  send<D = any>(data?: D, options?: SendResultOptions) {
    return new SendResult(data, options)
  }

  redirect(location: string, options?: RedirectResultOptions) {
    return new RedirectResult(location, options)
  }

  select<P>(selector: Selector<P>): P {
    return selector(this.context!)
  }
}
