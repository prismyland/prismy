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
  return res(null, statusCode, {
    location,
    ...extraHeaders
  })
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
): (context: Context) => Promise<R> {
  return async (context: Context) => {
    return handler(...(await resolveSelectors(context, selectors)))
  }
}

export function resolveSelectors<A extends any[]>(
  context: Context,
  selectors: Selectors<A>
): Promise<A> {
  return Promise.all(selectors.map(selector => selector(context))) as Promise<A>
}

export function middleware<A extends any[]>(
  selectors: Selectors<A>,
  mhandler: (
    next: () => Promise<ResponseObject<any>>
  ) => (...args: A) => Promise<ResponseObject<any>>
): Middleware {
  return context => async next =>
    compileHandler(selectors, mhandler(next))(context)
}
