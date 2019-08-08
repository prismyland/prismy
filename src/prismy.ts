import { IncomingMessage, ServerResponse, IncomingHttpHeaders } from 'http'
import { send } from 'micro'

export interface Context {
  req: IncomingMessage
}

export type Selector<T> = (context: Context) => T

export type Selectors<T> = { [P in keyof T]: Selector<T[P]> }

export interface ResponseObject<B> {
  body?: B
  statusCode: number
  headers: IncomingHttpHeaders
}

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

interface PrismyRequestListener<A extends any[]> {
  (req: IncomingMessage, res: ServerResponse): void
  handler(...args: A): any
  selectors: Selectors<A>
}

function compileHandler<A extends any[], R>(
  selectors: Selectors<A>,
  handler: (...args: A) => R
): (context: Context) => R {
  return (context: Context) => handler(...useSelectors(context, selectors))
}

function useSelectors<A extends any[]>(
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
    const compiled = compileHandler(selectors, mhandler(next))
    return compiled(context)
  }
}

export type Middleware = (
  context: Context
) => (next: () => ResponseObject<any>) => ResponseObject<any>

export function prismy<A extends any[]>(
  selectors: Selectors<A>,
  handler: (...args: A) => ResponseObject<any>,
  middlewareList: Middleware[] = []
): PrismyRequestListener<A> {
  async function requestListener(
    req: IncomingMessage,
    response: ServerResponse
  ) {
    const context = {
      req
    }
    const next = () => compileHandler(selectors, handler)(context)

    const pipe = middlewareList.reduce((next, middleware) => {
      return () => middleware(context)(next)
    }, next)

    let resObject
    try {
      resObject = pipe()
    } catch (error) {
      resObject = res(`Unhandled Error: ${error.message}`, 500)
    }
    await send(response, resObject.statusCode, resObject.body)
  }

  requestListener.handler = handler
  requestListener.selectors = selectors

  return requestListener
}
