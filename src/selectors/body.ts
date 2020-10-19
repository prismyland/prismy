import { readBufferBody, readJsonBody, readTextBody } from '../bodyReaders'
import { AsyncSelector } from '../types'

/**
 * Options for {@link createBodySelector}
 *
 * @public
 */
export interface BodySelectorOptions {
  limit?: string | number
  encoding?: string
}

export function createBodySelector(
  options?: BodySelectorOptions
): AsyncSelector<Buffer | object | string> {
  return async ({ req }) => {
    const type = req.headers['content-type']
    if (type === 'application/json' || type === 'application/ld+json') {
      return readJsonBody(req, options)
    } else if (type === 'application/x-www-form-urlencoded') {
      const qs = require('querystring')
      const body = await readTextBody(req, options)
      return qs.decode(body)
    } else {
      return readBufferBody(req, options)
    }
  }
}