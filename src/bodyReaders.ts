import { parse as parseContentType } from 'content-type'
import { IncomingMessage } from 'http'
import getRawBody from 'raw-body'
import { createError } from './error'
import { BufferOptions } from './types'

export function parseBufferOptions(
  req: IncomingMessage,
  options?: BufferOptions
) {
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

export const parseJSON = (str: any) => {
  try {
    return JSON.parse(str)
  } catch (err) {
    throw createError(400, `Invalid JSON`, err)
  }
}

const rawBodyMap = new WeakMap()

/**
 * Description of buffer
 *
 *
 * @param req - {@link IncomingMessage | request}
 * @param options - HTTP status code of the response
 * @returns Promise<string | Buffer>
 *
 * @public
 */
export async function readBufferBody(
  req: IncomingMessage,
  options?: BufferOptions
): Promise<Buffer | string> {
  const length = req.headers['content-length']
  const { limit, encoding } = parseBufferOptions(req, options)

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

export async function readTextBody(
  req: IncomingMessage,
  options?: BufferOptions
): Promise<string> {
  const { encoding } = parseBufferOptions(req, options)

  const buffer = await readBufferBody(req, options)
  return buffer.toString(encoding)
}

export async function readJsonBody(
  req: IncomingMessage,
  options?: BufferOptions
): Promise<object> {
  const body = await readTextBody(req, options)
  return parseJSON(body)
}
