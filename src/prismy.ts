import { AsyncLocalStorage } from 'async_hooks'
import { IncomingMessage, RequestListener, ServerResponse } from 'http'
import { PrismyMiddleware } from './middleware'
import { Handler, PrismyHandler } from './handler'
import { PrismySelector } from './selectors/createSelector'
import { MaybePromise, PrismyContext, SelectorReturnTypeTuple } from './types'
import { PrismyResult } from './result'

export const prismyContextStorage = new AsyncLocalStorage<PrismyContext>()
export function getPrismyContext(): PrismyContext {
  const context = prismyContextStorage.getStore()
  if (context == null) {
    throw new Error('Prismy context is not loaded.')
  }
  return context
}

/**
 * Make a RequestListener from PrismyHandler
 *
 * @example
 * ```ts
 * const handler = Handler([], () => { ... })
 *
 * const listener = prismy(handler)
 * // Or
 * // const listener = prismy([], () => {...})
 *
 * http.createServerlistener)
 * ```
 *
 * @param prismyHandler
 */
export function prismy<S extends PrismySelector<unknown>[]>(
  prismyHandler: PrismyHandler<S>,
): RequestListener

/**
 * Make a RequestListener from PrismyHandler
 *
 * @param selectors
 * @param handlerFunction
 * @param middlewareList
 */
export function prismy<S extends PrismySelector<any>[]>(
  selectors: [...S],
  handlerFunction: (
    ...args: SelectorReturnTypeTuple<S>
  ) => MaybePromise<PrismyResult>,
  middlewareList?: PrismyMiddleware<PrismySelector<any>[]>[],
): RequestListener
export function prismy<S extends PrismySelector<unknown>[]>(
  selectorsOrPrismyHandler: [...S] | PrismyHandler<S>,
  handlerFunction?: (
    ...args: SelectorReturnTypeTuple<S>
  ) => MaybePromise<PrismyResult>,
  middlewareList?: PrismyMiddleware<PrismySelector<any>[]>[],
): RequestListener {
  const injectedHandler =
    selectorsOrPrismyHandler instanceof PrismyHandler
      ? selectorsOrPrismyHandler
      : Handler(selectorsOrPrismyHandler, handlerFunction!, middlewareList)

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
