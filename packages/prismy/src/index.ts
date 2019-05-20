import { getSelectors } from './createSelectDecorators'
import { IncomingMessage, ServerResponse } from 'http'
export * from './decorators'
export * from './createSelectDecorators'

export interface HandlerClass {
  new (): { execute: (...args: any[]) => any }
}

export function prismy(handlerClass: HandlerClass) {
  return async function handler(req: IncomingMessage, res: ServerResponse) {
    const selectors = getSelectors(handlerClass)
    const args = await Promise.all(
      [...selectors].map(selector => selector(req, res))
    )

    return new handlerClass().execute(...args)
  }
}
