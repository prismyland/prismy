import { IncomingHttpHeaders } from 'http'
import { ResponseObject, Selectors, Context, Middleware } from './types'

export function res<B = unknown>(
  body: B,
  statusCode: number = 200,
  headers: IncomingHttpHeaders = {}
): ResponseObject<B> {
  return {
    body,
    statusCode,
    headers
  }
}

export function redirect(
  location: string,
  statusCode: number = 302,
  extraHeaders: IncomingHttpHeaders = {}
): ResponseObject<null> {
  return {
    body: null,
    statusCode,
    headers: {
      location,
      ...extraHeaders
    }
  }
}

export function compileHandler<A extends any[], R>(
  selectors: Selectors<A>,
  handler: (...args: A) => R
): (context: Context) => R {
  return (context: Context) => handler(...useSelectors(context, selectors))
}

export function useSelectors<A extends any[]>(
  context: Context,
  selectors: Selectors<A>
): A {
  return selectors.map(selector => selector(context)) as A
}

export function middleware<A extends any[]>(
  selectors: Selectors<A>,
  mhandler: (
    next: () => ResponseObject<any>
  ) => (...args: A) => ResponseObject<any>
): Middleware {
  return (context: Context) => (next: () => ResponseObject<any>) => {
    return compileHandler(selectors, mhandler(next))(context)
  }
}
