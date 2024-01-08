import {
  IncomingMessage,
  OutgoingHttpHeaders,
  RequestListener,
  ServerResponse,
} from 'http'
import { send } from './send'
import { ResponseObject } from './types'

export class PrismyResult {
  constructor(public resolver: RequestListener) {}
}

/**
 * Create a raw result it will directly handle node.js's requests and responses.
 * It is useful when controlling raw request stream and raw response stream.
 *
 * @param resolver
 * @returns {@link PrismyResult}
 */
export function RawResult(resolver: RequestListener): PrismyResult {
  return new PrismyResult(resolver)
}

export class PrismySendResult<B> extends PrismyResult {
  constructor(
    public readonly body: B,
    public readonly statusCode: number,
    public readonly headers: OutgoingHttpHeaders,
  ) {
    super((request: IncomingMessage, response: ServerResponse) => {
      this.resolve(request, response)
    })
  }

  /**
   * Resolve function used by http.Server
   * @param request
   * @param response
   */
  resolve(request: IncomingMessage, response: ServerResponse) {
    send(request, response, {
      body: this.body,
      statusCode: this.statusCode,
      headers: this.headers,
    })
  }

  /**
   * Creates a new result with a new status code
   *
   * @param statusCode - HTTP status code
   * @returns New {@link PrismySendResult}
   *
   * @public
   */
  setStatusCode(statusCode: number) {
    return new PrismySendResult(this.body, statusCode, this.headers)
  }

  /**
   * Creates a new result with a new body
   *
   * @param body - Body to be set
   * @returns New {@link PrismySendResult}
   *
   * @public
   */
  setBody<BB>(body: BB) {
    return new PrismySendResult<BB>(body, this.statusCode, this.headers)
  }

  /**
   * Creates a new result with the extra headers.
   * Merging new headers into existing headers. But duplicated headers will be replaced with new ones.
   * `{...existingHeaders, ...newHeaders}`
   *
   * @param newHeaders - HTTP response headers
   * @returns New {@link PrismySendResult}
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
    return new PrismySendResult(this.body, this.statusCode, {
      ...this.headers,
      ...newHeaders,
    })
  }

  /**
   * Creates a new result with the new headers.
   * This will flush all existing headers and set new ones only.
   *
   * @param newHeaders - HTTP response headers
   * @returns New {@link PrismySendResult}
   *
   * @public
   */
  setHeaders(headers: OutgoingHttpHeaders) {
    return new PrismySendResult(this.body, this.statusCode, headers)
  }
}

/**
 * Factory function for creating http responses
 *
 * @param body - Body of the response
 * @param statusCode - HTTP status code of the response
 * @param headers - HTTP headers for the response
 * @returns A {@link PrismySendResult} containing necessary information
 *
 * @public
 */
export function Result<B>(
  body: B,
  statusCode: number = 200,
  headers: OutgoingHttpHeaders = {},
): PrismySendResult<B> {
  return new PrismySendResult(body, statusCode, headers)
}

/**
 * Factory function for creating error http responses
 * Technically, it is functionally identical to `Result` but its arguments order is different from `Result`.
 *
 * @param body - Body of the response
 * @param statusCode - HTTP status code of the response
 * @param headers - HTTP headers for the response
 * @returns A {@link PrismySendResult} containing necessary information
 *
 * @public
 */
export function ErrorResult<B>(
  statusCode: number,
  body: B,
  headers: OutgoingHttpHeaders = {},
): PrismySendResult<B> {
  return new PrismySendResult(body, statusCode, headers)
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
export function Redirect(
  location: string,
  statusCode: number = 302,
  extraHeaders: OutgoingHttpHeaders = {},
): ResponseObject<null> {
  return Result(null, statusCode, {
    location,
    ...extraHeaders,
  })
}
