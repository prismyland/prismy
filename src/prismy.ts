import { IncomingMessage, ServerResponse } from 'http'
import { send } from './send'
import {
  ResponseObject,
  Selector,
  PrismyPureMiddleware,
  Promisable,
  Context,
  ContextHandler,
  PrismyRequestListener,
  SelectorReturnTypeTuple
} from './types'
import { res, compileHandler } from './utils'

/**
 * Generates a handler to be used by http.Server
 *
 * @example
 * ```ts
 * const worldSelector: Selector<string> = () => "world"!
 *
 * export default prismy([ worldSelector ], async world => {
 *  return res(`Hello ${world}!`) // Hello world!
 * })
 * ```
 *
 * @remarks
 * Selectors must be a tuple (`[Selector<string>, Selector<number>]`) not an
 * array (`Selector<string>|Selector<number>[] `). Be careful when declaring the
 * array outside of the function call.
 *
 * @param selectors - Tuple of Selectors to generate arguments for handler
 * @param handler - Business logic handling the request
 * @param middlewareList - Middleware to pass request and response through
 *
 * @public
 *
 */
export function prismy<S extends Selector<unknown>[]>(
  selectors: [...S],
  handler: (
    ...args: SelectorReturnTypeTuple<S>
  ) => Promisable<ResponseObject<any>>,
  middlewareList: PrismyPureMiddleware[] = []
): PrismyRequestListener<SelectorReturnTypeTuple<S>> {
  const contextHandler: ContextHandler = async (context: Context) => {
    const next = async () => compileHandler(selectors, handler)(context)

    const pipe = middlewareList.reduce((next, middleware) => {
      return () => middleware(context)(next)
    }, next)

    let resObject
    try {
      resObject = await pipe()
    } catch (error) {
      resObject = res(`Unhandled Error: ${error.message}`, 500)
    }

    return resObject
  }

  async function requestListener(
    req: IncomingMessage,
    response: ServerResponse
  ) {
    const context = {
      req
    }

    const resObject = await contextHandler(context)

    Object.entries(resObject.headers).forEach(([key, value]) => {
      /* istanbul ignore if */
      if (value == null) {
        return
      }
      response.setHeader(key, value)
    })

    await send(response, resObject.statusCode, resObject.body)
  }

  requestListener.handler = handler
  requestListener.contextHandler = contextHandler

  return requestListener
}
