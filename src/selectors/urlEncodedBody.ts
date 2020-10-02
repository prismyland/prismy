import { text } from 'micro'
import { ParsedUrlQuery, parse } from 'querystring'
import { createError } from '../error'
import { AsyncSelector } from '../types'

/**
 * Options for {@link createUrlEncodedBodySelector}
 *
 * @public
 */
export interface UrlEncodedBodySelectorOptions {
  limit?: string | number
  encoding?: string
}
/**
 * Factory function to create a selector to extract the url encoded body from a request
 *
 * @example
 * Simple example
 * ```ts
 *
 * const urlEncodedBodySelector = createUrlEncodedBodySelector({
 *  limit: "1mb"
 * })
 *
 * const prismyHandler = prismy(
 *  [urlEncodedBodySelector],
 *  body => {
 *    ...
 *  }
 * )
 *
 * ```
 *
 * @param options - {@link UrlEncodedBodySelectorOptions | Options} for the body parser
 * @returns selector for url encoded request bodies
 *
 * @throws
 * Throws an Error with 400 code if parsing fails
 *
 * @public
 */
export function createUrlEncodedBodySelector(
  options?: UrlEncodedBodySelectorOptions
): AsyncSelector<ParsedUrlQuery> {
  return async ({ req }) => {
    const textBody = await text(req, options)
    try {
      return parse(textBody)
    } catch (error) {
      /* istanbul ignore next */
      throw createError(400, 'Invalid url-encoded body', error)
    }
  }
}
