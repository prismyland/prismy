import { OutgoingHttpHeaders } from 'http'
import {
  ResponseObject,
  Selector,
  SelectorReturnTypeTuple,
  Context
} from './types'

/**
 * Factory function for creating http responses
 *
 * @param body - Body of the response
 * @param statusCode - HTTP status code of the response
 * @param headers - HTTP headers for the response
 * @returns A {@link ResponseObject | response object} containing necessary information
 *
 * @public
 */
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

/**
 * Factory function for easily generating a redirect response
 *
 * @param location - URL to redirect to
 * @param statusCode - Status code for response. Defaults to 302
 * @param extraHeaders - Additional headers of the response
 * @returns A redirect {@link ResponseObject | response} to location
 *
 * @public
 */
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

/**
 * Creates a new response with a new body
 *
 * @param resObject - The response to set the body on
 * @param body - Body to be set
 * @returns New {@link ResponseObject | response}  with the new body
 *
 * @public
 */
export function setBody<B1, B2>(
  resObject: ResponseObject<B1>,
  body: B2
): ResponseObject<B2> {
  return {
    ...resObject,
    body
  }
}

/**
 * Creates a new response with a new status code
 *
 * @param resObject - The response to set the code to
 * @param statusCode - HTTP status code
 * @returns New {@link ResponseObject | response} with the new statusCode
 *
 * @public
 */
export function setStatusCode<B>(
  resObject: ResponseObject<B>,
  statusCode: number
): ResponseObject<B> {
  return {
    ...resObject,
    statusCode
  }
}

/**
 * Creates a new response with the extra headers.
 *
 * @param resObject - The response to add the new headers to
 * @param extraHeaders - HTTP response headers
 * @returns New {@link ResponseObject | response} with the extra headers
 *
 * @public
 */
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

/**
 * Creates a new response overriting all headers with new ones.
 *
 * @param resObject - response to set new headers on
 * @param headers - HTTP response headers to set
 * @returns New {@link ResponseObject | response} with new headers set
 *
 * @public
 */
export function setHeaders<B>(
  resObject: ResponseObject<B>,
  headers: OutgoingHttpHeaders
): ResponseObject<B> {
  return {
    ...resObject,
    headers
  }
}

/**
 * Compile a handler into a runnable function by resolving selectors
 * and injecting the arguments into the handler.
 *
 * @param selectors - Selectors to gather handler arguments from
 * @param handler - Handler to be compiled
 * @returns compiled handler ready to be used
 *
 * @internal
 */
export function compileHandler<S extends Selector<unknown>[], R>(
  selectors: [...S],
  handler: (...args: SelectorReturnTypeTuple<S>) => R
): (context: Context) => Promise<R> {
  return async (context: Context) => {
    return handler(...(await resolveSelectors(context, selectors)))
  }
}

/**
 * Executes the selectors and produces an array of args to be passed to
 * a handler
 *
 * @param context - Context object to be passed to the selectors
 * @param selectors - array of selectos
 * @returns arguments for a handler
 *
 * @internal
 */
export function resolveSelectors<S extends Selector<unknown>[]>(
  context: Context,
  selectors: [...S]
): Promise<SelectorReturnTypeTuple<S>> {
  return Promise.all(selectors.map(selector => selector(context))) as Promise<
    SelectorReturnTypeTuple<S>
  >
}
