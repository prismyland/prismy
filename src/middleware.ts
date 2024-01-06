import { PrismySelector } from './selectors/createSelector'
import {
  ResponseObject,
  SelectorReturnTypeTuple,
  PrismyMiddleware,
} from './types'
import { compileHandler } from './utils'

/**
 * Factory function to create a prismy compatible middleware. Accepts selectors to help with
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
 *
 * ```
 *
 * @remarks
 * Selectors must be a tuple (`[Selector<string>, Selector<number>]`) not an
 * array (`Selector<string>|Selector<number>[] `). Be careful when declaring the
 * array outside of the function call.
 *
 * Be carefuly to remember the mhandler is a function which returns an _async_ function.
 * Not returning an async function can lead to strange type error messages.
 *
 * Another reason for long type error messages is not having `{"strict": true}` setting in
 * tsconfig.json or not compiling with --strict.
 *
 * @param selectors - Tuple of selectors
 * @param mhandler - Middleware handler
 * @returns A prismy compatible middleware
 *
 * @public
 */
export function middleware<SS extends PrismySelector<unknown>[]>(
  selectors: [...SS],
  mhandler: (
    next: () => Promise<ResponseObject<any>>,
  ) => (...args: SelectorReturnTypeTuple<SS>) => Promise<ResponseObject<any>>,
): PrismyMiddleware<SelectorReturnTypeTuple<SS>> {
  const middleware = () => async (next: () => Promise<ResponseObject<any>>) =>
    compileHandler(selectors, mhandler(next))()
  middleware.mhandler = mhandler

  return middleware
}
