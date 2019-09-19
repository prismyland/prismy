import { AsyncSelector } from '../types'
import { createError } from '../error'
import contentType from 'content-type'
import getRawBody from 'raw-body'

const rawBodyMap = new WeakMap()

/**
 * Options for {@link createBufferBodySelector}
 *
 * @public
 */
export interface BufferBodySelectorOptions {
  limit?: string | number
  encoding?: string
}

/**
 * Factory function that creates a selector to extract the request body in a buffer
 *
 * @example
 * Simple example
 * ```ts
 *
 * const bufferBodySelector = createBufferBodySelector({
 *  limit: "1mb"
 * })
 *
 * const prismyHandler = prismy(
 *  [bufferBodySelector],
 *  bufferBody => {
 *    ...
 *  }
 * )
 *
 * ```
 *
 * @param options - {@link BufferBodySelectorOptions | Options} for the buffer
 * @returns A selector for extracting request body in a buffer
 *
 * @public
 */
export function createBufferBodySelector({
  limit,
  encoding
}: BufferBodySelectorOptions = {}): AsyncSelector<string | Buffer> {
  return async context => {
    const { req } = context

    const body = rawBodyMap.get(req)
    if (body) {
      return body
    }

    const length = req.headers['content-length']

    if (encoding === undefined) {
      const type = req.headers['content-type']
      if (type != null) {
        encoding = contentType.parse(type).parameters.charset
      }
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
}
