import { AsyncLocalStorage } from 'async_hooks'
import { IncomingMessage, ServerResponse } from 'http'
import { PrismyMiddleware, PrismyNextFunction } from '.'
import { createErrorResObject } from './error'
import { PrismySelector } from './selectors/createSelector'
import { send } from './send'
import {
  ResponseObject,
  Promisable,
  PrismyContext,
  PrismyHandler,
  SelectorReturnTypeTuple,
} from './types'
import { compileHandler } from './utils'

export const prismyContextStorage = new AsyncLocalStorage<PrismyContext>()
export function getPrismyContext(): PrismyContext {
  const context = prismyContextStorage.getStore()
  if (context == null) {
    throw new Error('Prismy context is not loaded.')
  }
  return context
}

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
export function prismy<S extends PrismySelector<unknown>[]>(
  selectors: [...S],
  handler: (
    ...args: SelectorReturnTypeTuple<S>
  ) => Promisable<ResponseObject<any>>,
  middlewareList: PrismyMiddleware<any[]>[] = [],
): PrismyHandler<SelectorReturnTypeTuple<S>> {
  const resResolver = async () => {
    const next: PrismyNextFunction = compileHandler(selectors, handler)

    const pipe = middlewareList.reduce((next, middleware) => {
      return middleware(next)
    }, next)

    let resObject
    try {
      resObject = await pipe()
    } catch (error) {
      /* istanbul ignore next */
      if (process.env.NODE_ENV !== 'test') {
        console.error(error)
      }
      resObject = createErrorResObject(error)
    }

    return resObject
  }

  async function requestListener(
    request: IncomingMessage,
    response: ServerResponse,
  ) {
    const context: PrismyContext = {
      req: request,
    }
    prismyContextStorage.run(context, async () => {
      const resObject = await resResolver()

      send(request, response, resObject)
    })
  }

  requestListener.handler = handler
  requestListener.contextHandler = resResolver

  return requestListener
}
