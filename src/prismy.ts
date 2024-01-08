import { AsyncLocalStorage } from 'async_hooks'
import { IncomingMessage, RequestListener, ServerResponse } from 'http'
import { PrismyMiddleware } from './middleware'
import { Handler, PrismyHandler } from './handler'
import { PrismySelector } from './selectors/createSelector'
import { MaybePromise, PrismyContext, SelectorReturnTypeTuple } from './types'
import { PrismyResult } from './res'

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
 * const handler = Handler([], () => { ... })
 *
 * http.createServer(prismy(handler))
 * // Or directly
 * http.createServer([], () => { ... })
 * ```
 *
 * @param prismyHandler
 */
export function prismy<S extends PrismySelector<unknown>[]>(
  prismyHandler: PrismyHandler<S>,
): RequestListener

/**
 * Generates a handler to be used by http.Server
 *
 * prismy(Handler(...))
 *
 * @param selectors
 * @param handler
 * @param middlewareList
 */
export function prismy<S extends PrismySelector<any>[]>(
  selectors: [...S],
  handler: (...args: SelectorReturnTypeTuple<S>) => MaybePromise<PrismyResult>,
  middlewareList?: PrismyMiddleware<PrismySelector<any>[]>[],
): RequestListener
export function prismy<S extends PrismySelector<unknown>[]>(
  selectorsOrPrismyHandler: [...S] | PrismyHandler<S>,
  handler?: (...args: SelectorReturnTypeTuple<S>) => MaybePromise<PrismyResult>,
  middlewareList?: PrismyMiddleware<PrismySelector<any>[]>[],
): RequestListener {
  const injectedHandler =
    selectorsOrPrismyHandler instanceof PrismyHandler
      ? selectorsOrPrismyHandler
      : Handler(selectorsOrPrismyHandler, handler!, middlewareList)

  async function requestListener(
    request: IncomingMessage,
    response: ServerResponse,
  ) {
    const context: PrismyContext = {
      req: request,
    }
    prismyContextStorage.run(context, async () => {
      const resObject = await injectedHandler.handle()

      resObject.resolve(request, response)
    })
  }

  return requestListener
}
