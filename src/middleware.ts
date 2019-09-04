import {
  ResponseObject,
  Selector,
  Selectors,
  Unpromise,
  PrismyMiddleware,
  Context
} from './types'
import { compileHandler } from './utils'

/**
 * Factory function to create a prismy compatible middleware. Accepts selectors to help with 
 * testing, DI etc.
 * 
 * @param selectors - Tuple of selectors
 * @param mhandler - Middleware handler
 * 
 * @internal
 */
export function middlewarex<A extends any[]>(
  selectors: Selectors<A>,
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (...args: A) => Promise<ResponseObject<any>>
): PrismyMiddleware<A> {
  const middleware = (context: Context) => async (
    next: () => Promise<ResponseObject<any>>
  ) => compileHandler(selectors, mhandler(next))(context)
  middleware.mhandler = mhandler

  return middleware
}

export function middleware(
  selectors: never[],
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => () => Promise<ResponseObject<any>>
): PrismyMiddleware<[]>
export function middleware<A1>(
  selectors: [Selector<A1>],
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (arg1: Unpromise<A1>) => Promise<ResponseObject<any>>
): PrismyMiddleware<[Unpromise<A1>]>
export function middleware<A1, A2>(
  selectors: [Selector<A1>, Selector<A2>],
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (
    arg1: Unpromise<A1>,
    arg2: Unpromise<A2>
  ) => Promise<ResponseObject<any>>
): PrismyMiddleware<[Unpromise<A1>, Unpromise<A2>]>
export function middleware<A1, A2, A3>(
  selectors: [Selector<A1>, Selector<A2>, Selector<A3>],
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (
    arg1: Unpromise<A1>,
    arg2: Unpromise<A2>,
    arg3: Unpromise<A3>
  ) => Promise<ResponseObject<any>>
): PrismyMiddleware<[Unpromise<A1>, Unpromise<A2>, Unpromise<A3>]>
export function middleware<A1, A2, A3, A4>(
  selectors: [Selector<A1>, Selector<A2>, Selector<A3>, Selector<A4>],
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (
    arg1: Unpromise<A1>,
    arg2: Unpromise<A2>,
    arg3: Unpromise<A3>,
    arg4: Unpromise<A4>
  ) => Promise<ResponseObject<any>>
): PrismyMiddleware<
  [Unpromise<A1>, Unpromise<A2>, Unpromise<A3>, Unpromise<A4>]
>
export function middleware<A1, A2, A3, A4, A5>(
  selectors: [
    Selector<A1>,
    Selector<A2>,
    Selector<A3>,
    Selector<A4>,
    Selector<A5>
  ],
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (
    arg1: Unpromise<A1>,
    arg2: Unpromise<A2>,
    arg3: Unpromise<A3>,
    arg4: Unpromise<A4>,
    arg5: Unpromise<A5>
  ) => Promise<ResponseObject<any>>
): PrismyMiddleware<
  [Unpromise<A1>, Unpromise<A2>, Unpromise<A3>, Unpromise<A4>, Unpromise<A5>]
>
export function middleware<A1, A2, A3, A4, A5, A6>(
  selectors: [
    Selector<A1>,
    Selector<A2>,
    Selector<A3>,
    Selector<A4>,
    Selector<A5>,
    Selector<A6>
  ],
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (
    arg1: Unpromise<A1>,
    arg2: Unpromise<A2>,
    arg3: Unpromise<A3>,
    arg4: Unpromise<A4>,
    arg5: Unpromise<A5>,
    arg6: Unpromise<A6>
  ) => Promise<ResponseObject<any>>
): PrismyMiddleware<
  [
    Unpromise<A1>,
    Unpromise<A2>,
    Unpromise<A3>,
    Unpromise<A4>,
    Unpromise<A5>,
    Unpromise<A6>
  ]
>
export function middleware<A1, A2, A3, A4, A5, A6, A7>(
  selectors: [
    Selector<A1>,
    Selector<A2>,
    Selector<A3>,
    Selector<A4>,
    Selector<A5>,
    Selector<A6>,
    Selector<A7>
  ],
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (
    arg1: Unpromise<A1>,
    arg2: Unpromise<A2>,
    arg3: Unpromise<A3>,
    arg4: Unpromise<A4>,
    arg5: Unpromise<A5>,
    arg6: Unpromise<A6>,
    arg7: Unpromise<A7>
  ) => Promise<ResponseObject<any>>
): PrismyMiddleware<
  [
    Unpromise<A1>,
    Unpromise<A2>,
    Unpromise<A3>,
    Unpromise<A4>,
    Unpromise<A5>,
    Unpromise<A6>,
    Unpromise<A7>
  ]
>
export function middleware<A1, A2, A3, A4, A5, A6, A7, A8>(
  selectors: [
    Selector<A1>,
    Selector<A2>,
    Selector<A3>,
    Selector<A4>,
    Selector<A5>,
    Selector<A6>,
    Selector<A7>,
    Selector<A8>
  ],
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (
    arg1: Unpromise<A1>,
    arg2: Unpromise<A2>,
    arg3: Unpromise<A3>,
    arg4: Unpromise<A4>,
    arg5: Unpromise<A5>,
    arg6: Unpromise<A6>,
    arg7: Unpromise<A7>,
    arg8: Unpromise<A8>
  ) => Promise<ResponseObject<any>>
): PrismyMiddleware<
  [
    Unpromise<A1>,
    Unpromise<A2>,
    Unpromise<A3>,
    Unpromise<A4>,
    Unpromise<A5>,
    Unpromise<A6>,
    Unpromise<A7>,
    Unpromise<A8>
  ]
>
export function middleware<A1, A2, A3, A4, A5, A6, A7, A8, A9>(
  selectors: [
    Selector<A1>,
    Selector<A2>,
    Selector<A3>,
    Selector<A4>,
    Selector<A5>,
    Selector<A6>,
    Selector<A7>,
    Selector<A8>,
    Selector<A9>
  ],
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (
    arg1: Unpromise<A1>,
    arg2: Unpromise<A2>,
    arg3: Unpromise<A3>,
    arg4: Unpromise<A4>,
    arg5: Unpromise<A5>,
    arg6: Unpromise<A6>,
    arg7: Unpromise<A7>,
    arg8: Unpromise<A8>,
    arg9: Unpromise<A9>
  ) => Promise<ResponseObject<any>>
): PrismyMiddleware<
  [
    Unpromise<A1>,
    Unpromise<A2>,
    Unpromise<A3>,
    Unpromise<A4>,
    Unpromise<A5>,
    Unpromise<A6>,
    Unpromise<A7>,
    Unpromise<A8>,
    Unpromise<A9>
  ]
>
export function middleware<A1, A2, A3, A4, A5, A6, A7, A8, A9, A10>(
  selectors: [
    Selector<A1>,
    Selector<A2>,
    Selector<A3>,
    Selector<A4>,
    Selector<A5>,
    Selector<A6>,
    Selector<A7>,
    Selector<A8>,
    Selector<A9>,
    Selector<A10>
  ],
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (
    arg1: Unpromise<A1>,
    arg2: Unpromise<A2>,
    arg3: Unpromise<A3>,
    arg4: Unpromise<A4>,
    arg5: Unpromise<A5>,
    arg6: Unpromise<A6>,
    arg7: Unpromise<A7>,
    arg8: Unpromise<A8>,
    arg9: Unpromise<A9>,
    arg10: Unpromise<A10>
  ) => Promise<ResponseObject<any>>
): PrismyMiddleware<
  [
    Unpromise<A1>,
    Unpromise<A2>,
    Unpromise<A3>,
    Unpromise<A4>,
    Unpromise<A5>,
    Unpromise<A6>,
    Unpromise<A7>,
    Unpromise<A8>,
    Unpromise<A9>,
    Unpromise<A10>
  ]
>
export function middleware<A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, A11>(
  selectors: [
    Selector<A1>,
    Selector<A2>,
    Selector<A3>,
    Selector<A4>,
    Selector<A5>,
    Selector<A6>,
    Selector<A7>,
    Selector<A8>,
    Selector<A9>,
    Selector<A10>,
    Selector<A11>
  ],
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (
    arg1: Unpromise<A1>,
    arg2: Unpromise<A2>,
    arg3: Unpromise<A3>,
    arg4: Unpromise<A4>,
    arg5: Unpromise<A5>,
    arg6: Unpromise<A6>,
    arg7: Unpromise<A7>,
    arg8: Unpromise<A8>,
    arg9: Unpromise<A9>,
    arg10: Unpromise<A10>,
    arg11: Unpromise<A11>
  ) => Promise<ResponseObject<any>>
): PrismyMiddleware<
  [
    Unpromise<A1>,
    Unpromise<A2>,
    Unpromise<A3>,
    Unpromise<A4>,
    Unpromise<A5>,
    Unpromise<A6>,
    Unpromise<A7>,
    Unpromise<A8>,
    Unpromise<A9>,
    Unpromise<A10>,
    Unpromise<A11>
  ]
>
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
export function middleware<A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, A11, A12>(
  selectors: [
    Selector<A1>,
    Selector<A2>,
    Selector<A3>,
    Selector<A4>,
    Selector<A5>,
    Selector<A6>,
    Selector<A7>,
    Selector<A8>,
    Selector<A9>,
    Selector<A10>,
    Selector<A11>,
    Selector<A12>
  ],
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (
    arg1: Unpromise<A1>,
    arg2: Unpromise<A2>,
    arg3: Unpromise<A3>,
    arg4: Unpromise<A4>,
    arg5: Unpromise<A5>,
    arg6: Unpromise<A6>,
    arg7: Unpromise<A7>,
    arg8: Unpromise<A8>,
    arg9: Unpromise<A9>,
    arg10: Unpromise<A10>,
    arg11: Unpromise<A11>,
    arg12: Unpromise<A12>
  ) => Promise<ResponseObject<any>>
): PrismyMiddleware<
  [
    Unpromise<A1>,
    Unpromise<A2>,
    Unpromise<A3>,
    Unpromise<A4>,
    Unpromise<A5>,
    Unpromise<A6>,
    Unpromise<A7>,
    Unpromise<A8>,
    Unpromise<A9>,
    Unpromise<A10>,
    Unpromise<A11>,
    Unpromise<A12>
  ]
>
export function middleware(
  selectors: Selector<any>[],
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (...args: any[]) => Promise<ResponseObject<any>>
): PrismyMiddleware<any[]> {
  return middlewarex(selectors, mhandler)
}
