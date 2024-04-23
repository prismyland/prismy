import { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from 'http'
import { sendPrismyResult } from './send'
import cookie from 'cookie'

export class PrismyResult<B = unknown> {
  constructor(
    public readonly body: B,
    public readonly statusCode: number,
    public readonly headers: OutgoingHttpHeaders,
  ) {}

  /**
   * Resolve function used by http.Server
   * @param request
   * @param response
   */
  resolve(request: IncomingMessage, response: ServerResponse) {
    sendPrismyResult(request, response, this)
  }

  /**
   * Creates a new result with a new status code
   *
   * @param statusCode - HTTP status code
   * @returns New {@link PrismyResult}
   *
   * @public
   */
  setStatusCode(statusCode: number) {
    return new PrismyResult(this.body, statusCode, this.headers)
  }

  /**
   * Creates a new result with a new body
   *
   * @param body - Body to be set
   * @returns New {@link PrismyResult}
   *
   * @public
   */
  setBody<BB>(body: BB) {
    return new PrismyResult<BB>(body, this.statusCode, this.headers)
  }

  /**
   * Creates a new result with the extra headers.
   * Merging new headers into existing headers. But duplicated headers will be replaced with new ones.
   * `{...existingHeaders, ...newHeaders}`
   *
   * @param newHeaders - HTTP response headers
   * @returns New {@link PrismyResult}
   *
   * To set multiple headers with same name, use an array.
   * @example
   * ```ts
   * const existingHeaderValue = result.headers['multiple-values']
   * let newHeaderValues = [...]
   *
   * if (existingHeaderValue != null) {
   *   if (Array.isArray(existingHeaderValue)) {
   *     newHeaderValues = [...existingHeaderValue, ...newHeaderValues]
   *   } else {
   *     newHeaderValues = [existingHeaderValue, ...newHeaderValues]
   *   }
   * }
   *
   * result.updateHeaders({
   *   'multiple-values': newHeaderValues
   * })
   * ```
   *
   * @public
   */
  updateHeaders(newHeaders: OutgoingHttpHeaders) {
    return new PrismyResult(this.body, this.statusCode, {
      ...this.headers,
      ...newHeaders,
    })
  }

  /**
   * Appends `set-cookie` header. This method won't replace existing `set-cookie` header.
   * To remove or replace existing headers, please use `updateHeaders` method.
   *
   * @param key Cookie key
   * @param value Cookie value
   * @param options Cookie options
   * @returns New {@link PrismyResult}
   */
  setCookie(
    key: string,
    value: string,
    options?: cookie.CookieSerializeOptions,
  ) {
    const existingSetCookieHeaders = this.headers['set-cookie']
    const newSetCookieHeader = cookie.serialize(key, value, options)

    return this.updateHeaders({
      'set-cookie':
        existingSetCookieHeaders == null
          ? [newSetCookieHeader]
          : Array.isArray(existingSetCookieHeaders)
            ? [...existingSetCookieHeaders, newSetCookieHeader]
            : [existingSetCookieHeaders, newSetCookieHeader],
    })
  }

  /**
   * Creates a new result with the new headers.
   * This will flush all existing headers and set new ones only.
   *
   * @param newHeaders - HTTP response headers
   * @returns New {@link PrismyResult}
   *
   * @public
   */
  setHeaders(headers: OutgoingHttpHeaders) {
    return new PrismyResult(this.body, this.statusCode, headers)
  }
}

/**
 * Factory function for creating http responses
 *
 * @param body - Body of the response
 * @param statusCode - HTTP status code of the response
 * @param headers - HTTP headers for the response
 * @returns A {@link PrismyResult} containing necessary information
 *
 * @public
 */
export function Result<B>(
  body: B,
  statusCode: number = 200,
  headers: OutgoingHttpHeaders = {},
): PrismyResult<B> {
  return new PrismyResult(body, statusCode, headers)
}

/**
 * Factory function for creating error http responses
 * Technically, it is functionally identical to `Result` but its arguments order is different from `Result`.
 *
 * @param body - Body of the response
 * @param statusCode - HTTP status code of the response
 * @param headers - HTTP headers for the response
 * @returns A {@link PrismyResult} containing necessary information
 *
 * @public
 */
export function ErrorResult<B>(
  statusCode: number,
  body: B,
  headers: OutgoingHttpHeaders = {},
): PrismyErrorResult<B> {
  return new PrismyErrorResult(body, statusCode, headers)
}

export class PrismyErrorResult<B = unknown> extends PrismyResult<B> {
  readonly __isError = true
}

export function isErrorResult(
  result: PrismyResult,
): result is PrismyErrorResult {
  if ((result as PrismyErrorResult).__isError) {
    return true
  }
  return false
}

export function assertErrorResult(
  result: PrismyResult,
): asserts result is PrismyErrorResult {
  if (isErrorResult(result)) {
    return
  }
  throw new Error(
    [
      'The given PrismyResult is NOT an error result.',
      '',
      'Result:',
      jsonStringifyRecursive(result),
    ].join('\n'),
  )
}

export function assertNoErrorResult<P extends PrismyResult>(
  result: P,
): asserts result is P extends PrismyErrorResult ? never : P {
  if (!isErrorResult(result)) {
    return
  }
  throw new Error(
    [
      'The given PrismyResult is an error result.',
      '',
      'Result:',
      jsonStringifyRecursive(result),
    ].join('\n'),
  )
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
export function RedirectResult(
  location: string,
  statusCode: number = 302,
  extraHeaders: OutgoingHttpHeaders = {},
): PrismyRedirectResult {
  return new PrismyRedirectResult(null, statusCode, {
    location,
    ...extraHeaders,
  })
}

export class PrismyRedirectResult extends PrismyResult<null> {
  readonly __isRedirect = true
}

export function isRedirectResult(
  result: PrismyResult,
): result is PrismyRedirectResult {
  if ((result as PrismyRedirectResult).__isRedirect) {
    return true
  }
  return false
}

export function assertRedirectResult(
  result: PrismyResult,
): asserts result is PrismyRedirectResult {
  if (isRedirectResult(result)) {
    return
  }
  throw new Error(
    [
      'The given PrismyResult is NOT a redirect result.',
      '',
      'Result:',
      jsonStringifyRecursive(result),
    ].join('\n'),
  )
}

export function assertNoRedirectResult<P extends PrismyResult>(
  result: P,
): asserts result is P extends PrismyRedirectResult ? never : P {
  if (!isRedirectResult(result)) {
    return
  }
  throw new Error(
    [
      'The given PrismyResult is a redirect result.',
      '',
      'Result:',
      jsonStringifyRecursive(result),
    ].join('\n'),
  )
}

/* istanbul ignore next */
function jsonStringifyRecursive(value: any) {
  const cache = new Set()
  return JSON.stringify(
    value,
    (_key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '(Recursive)'
        }
        cache.add(value)
      }
      return value
    },
    2,
  )
}
