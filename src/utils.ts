import { OutgoingHttpHeaders, ServerResponse, IncomingMessage } from 'http'
import { ResponseObject, Selectors, Context } from './types'
import { Stream } from 'stream'
import { createError } from './error'
import contentType from 'content-type'
import getRawBody from 'raw-body'

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
export function compileHandler<A extends any[], R>(
  selectors: Selectors<A>,
  handler: (...args: A) => R
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
export function resolveSelectors<A extends any[]>(
  context: Context,
  selectors: Selectors<A>
): Promise<A> {
  return Promise.all(selectors.map(selector => selector(context))) as Promise<A>
}

const { NODE_ENV } = process.env
const DEV = NODE_ENV === 'development'

function isStream(stream: any) {
  return (
    stream !== null &&
    typeof stream === 'object' &&
    typeof stream.pipe === 'function'
  )
}

function readable(stream: any) {
  return (
    isStream(stream) &&
    stream.readable !== false &&
    typeof stream._read === 'function' &&
    typeof stream._readableState === 'object'
  )
}

export function send(res: ServerResponse, code: number = 200, obj: any = null) {
  res.statusCode = code

  if (obj === null) {
    res.end()
    return
  }

  if (Buffer.isBuffer(obj)) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/octet-stream')
    }

    res.setHeader('Content-Length', obj.length)
    res.end(obj)
    return
  }

  if (obj instanceof Stream || readable(obj)) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/octet-stream')
    }

    obj.pipe(res)
    return
  }

  let str = obj

  if (typeof obj === 'object' || typeof obj === 'number') {
    // We stringify before setting the header
    // in case `JSON.stringify` throws and a
    // 500 has to be sent instead

    // the `JSON.stringify` call is split into
    // two cases as `JSON.stringify` is optimized
    // in V8 if called with only one argument
    if (DEV) {
      str = JSON.stringify(obj, null, 2)
    } else {
      str = JSON.stringify(obj)
    }

    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
    }
  }

  res.setHeader('Content-Length', Buffer.byteLength(str))
  res.end(str)
}

export function parseJSON(str: string) {
  try {
    return JSON.parse(str)
  } catch (err) {
    throw createError(400, 'Invalid JSON', err)
  }
}

interface BodyParserOptions {
  encoding?: string
  limit?: string | number
}

// Maps requests to buffered raw bodies so that
// multiple calls to `json` work as expected
const rawBodyMap = new WeakMap()

export async function buffer(
  req: IncomingMessage,
  { encoding, limit }: BodyParserOptions = {}
) {
  const type = req.headers['content-type'] || 'text/plain'
  const length = req.headers['content-length']

  // eslint-disable-next-line no-undefined
  if (encoding === undefined) {
    encoding = contentType.parse(type).parameters.charset
  }

  const body = rawBodyMap.get(req)

  if (body) {
    return body
  }

  if (req.complete) {
    throw createError(500, `Body has been parsed already`)
  }

  let buf
  try {
    buf = await getRawBody(req, { limit, length, encoding })
  } catch (error) {
    if (error.type === 'entity.too.large') {
      throw createError(413, `Body exceeded ${limit} limit`, error)
    } else {
      throw createError(400, 'Invalid body', error)
    }
  }
  rawBodyMap.set(req, buf)

  return buf
}

export function text(
  req: IncomingMessage,
  { limit, encoding }: BodyParserOptions = {}
) {
  return buffer(req, { limit, encoding }).then(body => body.toString(encoding))
}

export function json(req: IncomingMessage, opts?: BodyParserOptions) {
  return text(req, opts).then(body => parseJSON(body))
}
