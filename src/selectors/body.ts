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

/**
 * Factory function to create a general selector that detects type of body and then extracts it respectively from a request
 *
 * @example
 * Simple example
 * ```ts
 *
 * const bodySelector = createBodySelector({
 *  limit: "1mb"
 * })
 *
 * const prismyHandler = prismy(
 *  [bodySelector],
 *  body => {
 *    ...
 *  }
 * )
 *
 * ```
 *
 * @param options - Options such as limit and encoding
 * @returns a selector for request bodies
 *
 * @public
 */
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