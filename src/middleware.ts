import { PrismyNextFunction, PrismyResult } from '.'
import { PrismySelector } from './selectors/createSelector'
import { SelectorReturnTypeTuple } from './types'
import { compileHandler } from './utils'

export class PrismyMiddleware<
  S extends PrismySelector<any>[] = PrismySelector<any>[],
> {
  constructor(
    public selectors: [...S],
    /**
     * PrismyHandler exposes `handler` for unit testing the handler.
     * @param args selected arguments
     */
    public handler: (
      next: PrismyNextFunction,
    ) => (...args: SelectorReturnTypeTuple<S>) => Promise<PrismyResult>,
  ) {}

  pipe(next: PrismyNextFunction) {
    return compileHandler(this.selectors, this.handler(next))
  }
}

/**
 * Factory function to create a prismy middleware. Accepts selectors to help with
 * testing, DI etc.
 *
 * @example
 * Simple Example
 * ```ts
 *
 * const withCors = middleware([], next => async () => {
 *  const resObject = await next()
 *
 *  return updateHeaders(resObject, {
 *    'access-control-allow-origin': '*'
 *  })
 * })
 * ```
 *
 * @remarks
 * Selectors must be a tuple (`[Selector<string>, Selector<number>]`) not an
 * array (`Selector<string>|Selector<number>[] `). Be careful when declaring the
 * array outside of the function call.
 *
 * Be carefuly to remember the handler is a function which returns an _async_ function.
 * Not returning an async function can lead to strange type error messages.
 *
 * Another reason for long type error messages is not having `{"strict": true}` setting in
 * tsconfig.json or not compiling with --strict.
 *
 * @param selectors - Tuple of selectors
 * @param handler - Middleware handler
 * @returns A prismy compatible middleware
 *
 * @public
 */
export function Middleware<SS extends PrismySelector<any>[]>(
  selectors: [...SS],
  handler: (
    next: PrismyNextFunction,
  ) => (...args: SelectorReturnTypeTuple<SS>) => Promise<PrismyResult>,
): PrismyMiddleware<SS> {
  return new PrismyMiddleware(selectors, handler)
}
