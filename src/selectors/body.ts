import { parse } from 'querystring'
import { readJsonBody, readTextBody } from '../bodyReaders'
import { createError } from '../error'
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
): AsyncSelector<object | string> {
  return async ({ req }) => {
    const type = req.headers['content-type']

    if (type === 'application/json' || type === 'application/ld+json') {
      return readJsonBody(req, options)
    } else if (type === 'application/x-www-form-urlencoded') {
      const textBody = await readTextBody(req, options)
      try {
        return parse(textBody)
      } catch (error) {
        /* istanbul ignore next */
        throw createError(400, 'Invalid url-encoded body', error)
      }
    } else {
      return readTextBody(req, options)
    }
  }
}