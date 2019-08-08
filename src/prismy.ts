import { IncomingMessage, ServerResponse } from 'http'
import { send } from 'micro'
import {
  ResponseObject,
  Selectors,
  Middleware,
  PrismyRequestListener
} from './types'
import { res, compileHandler } from './utils'

export function prismy<A extends any[]>(
  selectors: Selectors<A>,
  handler: (...args: A) => ResponseObject<any>,
  middlewareList: Middleware[] = []
): PrismyRequestListener<A> {
  async function requestListener(
    req: IncomingMessage,
    response: ServerResponse
  ) {
    const context = {
      req
    }
    const next = () => compileHandler(selectors, handler)(context)

    const pipe = middlewareList.reduce((next, middleware) => {
      return () => middleware(context)(next)
    }, next)

    let resObject
    try {
      resObject = pipe()
    } catch (error) {
      resObject = res(`Unhandled Error: ${error.message}`, 500)
    }

    Object.entries(resObject.headers).forEach(([key, value]) => {
      if (value == null) {
        return
      }
      response.setHeader(key, value)
    })

    await send(response, resObject.statusCode, resObject.body)
  }

  requestListener.handler = handler
  requestListener.selectors = selectors

  return requestListener
}
