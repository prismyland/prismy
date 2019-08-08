import { OutgoingHttpHeaders } from 'http'
import { ResponseObject, Selectors, Context, Middleware } from './types'

export function res<B = unknown>(
  body: B,
  statusCode: number = 200,
  headers: OutgoingHttpHeaders = {}
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
  extraHeaders: OutgoingHttpHeaders = {}
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

export function setBody<B1, B2>(
  resObject: ResponseObject<B1>,
  body: B2
): ResponseObject<B2> {
  return {
    ...resObject,
    body
  }
}

export function setStatusCode<B>(
  resObject: ResponseObject<B>,
  statusCode: number
): ResponseObject<B> {
  return {
    ...resObject,
    statusCode
  }
}

export function updateHeaders<B>(
  resObject: ResponseObject<B>,
  extraHeaders: OutgoingHttpHeaders
): ResponseObject<B> {
  return {
    ...resObject,
    headers: {
      ...resObject.headers,
      ...extraHeaders
    }
  }
}

export function setHeaders<B>(
  resObject: ResponseObject<B>,
  headers: OutgoingHttpHeaders
): ResponseObject<B> {
  return {
    ...resObject,
    headers
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
