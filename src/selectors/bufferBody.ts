import contentType from 'content-type'
import getRawBody from 'raw-body'
import { AsyncSelector, Context } from '../types'
import { createError } from '../error'

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
export function createBufferBodySelector(
  options: BufferBodySelectorOptions
): AsyncSelector<string | Buffer> {
  return async (context: Context) => {
    const { req } = context
    const { limit = '1mb', encoding: encode } = options
    const type = req.headers['content-type'] || 'text/plain'
    const length = req.headers['content-length']

    let encoding = encode

    if (encoding === undefined) {
      encoding = contentType.parse(type).parameters.charset
    }

    const body = rawBodyMap.get(req)
    if (body) {
      return body
    }

    return getRawBody(req, { length, limit, encoding })
      .then(buf => {
        rawBodyMap.set(req, buf)
      })
      .catch(err => {
        if (err.type === 'entity.too.large') {
          throw createError(413, `Body exceeded ${limit} limit`, err)
        } else {
          throw createError(400, 'Invalid body', err)
        }
      })
  }
}
