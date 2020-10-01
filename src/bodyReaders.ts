import { parse as parseContentType } from 'content-type'
import { IncomingMessage } from 'http'
import getRawBody from 'raw-body'
import { createError } from './error'
import { BufferOptions } from './types'

const rawBodyMap = new WeakMap()
/**
 * An async function to buffer the incoming request body
 *
 * @remarks
 * Can be called multiple times, as it caches the raw request body
 * the first time
 *
 * @param req {@link IncomingMessage}
 * @param options - Options including how much data should be aggregated
 * before parsing at max and setting encoding type
 * @returns Promise<Buffer | string>
 *
 * @public
 */
export async function readBufferBody(
  req: IncomingMessage,
  options?: BufferOptions
): Promise<Buffer | string> {
  const length = req.headers['content-length']
  const { limit, encoding } = resolveBufferOptions(req, options)

  const body = rawBodyMap.get(req)
  if (body) {
    return body
  }

  try {
    const buffer = await getRawBody(req, { length, limit, encoding })
    rawBodyMap.set(req, buffer)
    return buffer
  } catch (error) {
    if (error.type === 'entity.too.large') {
      throw createError(413, `Body exceeded ${limit} limit`, error)
    } else {
      throw createError(400, `Invalid body`, error)
    }
  }
}

/**
 * An async function to parse buffer body and return it in the form
 * of text
 *
 * @param req {@link IncomingMessage}
 * @param options - Options including how much data should be aggregated
 * before parsing at max and setting encoding type
 * @returns Promise<string>
 *
 * @public
 */
export async function readTextBody(
  req: IncomingMessage,
  options?: BufferOptions
): Promise<string> {
  const { encoding } = resolveBufferOptions(req, options)

  const buffer = await readBufferBody(req, options)
  return buffer.toString(encoding)
}

/**
 * An async function to parse buffered body and return it in the form
 * of JSON object
 *
 * @param req {@link IncomingMessage}
 * @param options - Options including how much data should be aggregated
 * before parsing at max and setting encoding type
 * @returns Promise<object>
 *
 * @public
 */
export async function readJsonBody(
  req: IncomingMessage,
  options?: BufferOptions
): Promise<object> {
  const body = await readTextBody(req, options)
  return parseJSON(body)
}

function resolveBufferOptions(req: IncomingMessage, options?: BufferOptions) {
  const type = req.headers['content-type'] || 'text/plain'

  let { limit = '1mb', encoding } = options || {}
  if (encoding === undefined) {
    encoding = parseContentType(type).parameters.charset
  }

  return {
    limit,
    encoding
  }
}

function parseJSON(str: any) {
  try {
    return JSON.parse(str)
  } catch (err) {
    throw createError(400, `Invalid JSON`, err)
  }
}
