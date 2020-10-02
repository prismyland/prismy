import { parse as parseContentType } from 'content-type'
import getRawBody from 'raw-body'
import { IncomingMessage } from 'http'
import { BufferBodyOptions } from './types'
import { createError } from './error'

const rawBodyMap = new WeakMap()

/**
 * An async function to buffer the incoming request body
 *
 * @remarks
 * Can be called multiple times, as it caches the raw request body the first time
 *
 * @param req {@link IncomingMessage}
 * @param options Options such as limit and encoding
 * @returns Buffer body
 *
 * @public
 */
export const readBufferBody = async (
  req: IncomingMessage,
  options?: BufferBodyOptions
): Promise<Buffer | string> => {
  const { limit, encoding } = resolveBufferBodyOptions(req, options)
  const length = req.headers['content-length']

  const body = rawBodyMap.get(req)
  if (body) {
    return body
  }

  try {
    const buffer = await getRawBody(req, { limit, length, encoding })
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
 * An async function to parse the incoming request body into text
 *
 * @param req {@link IncomingMessage}
 * @param options Options such as limit and encoding
 * @returns Text body
 *
 * @public
 */
export const readTextBody = async (
  req: IncomingMessage,
  options?: BufferBodyOptions
): Promise<string> => {
  const { encoding } = resolveBufferBodyOptions(req, options)
  const body = await readBufferBody(req, options)
  return body.toString(encoding)
}

function resolveBufferBodyOptions(
  req: IncomingMessage,
  options?: BufferBodyOptions
): BufferBodyOptions {
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
