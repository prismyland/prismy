import { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from 'http'
import { Stream } from 'stream'
import { readable } from 'is-stream'
import contentType from 'content-type'
import getRawBody from 'raw-body'
import {
  BufferOption,
  Context,
  ResponseObject,
  Selector,
  SelectorReturnTypeTuple
} from './types'
import { createError } from './error'

const { NODE_ENV } = process.env
const DEV = NODE_ENV === 'development'

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

// Fix #33
export async function send(
  res: ServerResponse,
  code: number,
  data?: any
): Promise<void> {
  res.statusCode = code

  if (data === null) {
    res.end()
    return
  }

  if (Buffer.isBuffer(data)) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/octet-stream')
    }
    res.setHeader('Content-Length', data.length)
    res.end(data)
    return
  }

  if (data instanceof Stream || readable(data)) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/octet-stream')
    }

    data.pipe(res)
    return
  }

  let str = data

  if (typeof data === 'object' || typeof data === 'number') {
    if (DEV) {
      str = JSON.stringify(data, null, 2)
    } else {
      str = JSON.stringify(data)
    }

    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json;charset=utf-8')
    }
  }

  res.setHeader('Content-Length', Buffer.byteLength(str))
  res.end(str)
}

const rawBodyMap = new WeakMap()

export async function buffer(
  req: IncomingMessage,
  options: BufferOption
): Promise<string | Buffer> {
  const type = req.headers['content-type'] || 'text/plain'
  const length = req.headers['content-length']

  const { limit = '1mb', encoding: encode } = options
  let encoding = encode

  if (encode === undefined) {
    encoding = contentType.parse(type).parameters.charset
  }

  const body = rawBodyMap.get(req)
  if (body) {
    return body
  }

  return getRawBody(req, { length, limit, encoding })
    .then(buf => {
      rawBodyMap.set(req, buf)
      return buf
    })
    .catch(err => {
      if (err.type === 'entity.too.large') {
        throw createError(413, `Body exceeded ${limit} limit`, err)
      } else {
        throw createError(400, `Invalid body`, err)
      }
    })
}
