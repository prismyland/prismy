import { readJsonBody } from '../bodyReaders'
import { createError } from '../error'
import { getPrismyContext } from '../prismy'
import { createPrismySelector, PrismySelector } from './createSelector'

/**
 * Options for {@link createJsonBodySelector}
 *
 * @public
 */
export interface JsonBodySelectorOptions {
  limit?: string | number
  encoding?: string
}

/**
 * Factory function to create a selector to extract the JSON encoded body of a request
 *
 * @example
 * Simple example
 * ```ts
 *
 * const jsonBodySelector = createJsonBodySelector({
 *  limit: "1mb"
 * })
 *
 * const prismyHandler = prismy(
 *  [jsonBodySelector],
 *  body => {
 *    ...
 *  }
 * )
 *
 * ```
 *
 * @param options - {@link JsonBodySelectorOptions | Options} for the body parsing
 * @returns A selector for JSON body requests
 *
 * @throws
 * Throws an Error with 400 if content type is not application/json
 *
 * @public
 */
export function JsonBodySelector(
  options?: JsonBodySelectorOptions,
): PrismySelector<any> {
  return createPrismySelector(() => {
    const { req } = getPrismyContext()
    const contentType = req.headers['content-type']
    if (!isContentTypeApplicationJSON(contentType)) {
      throw createError(
        400,
        `Content type must be application/json. (Current: ${contentType})`,
      )
    }

    return readJsonBody(req, options)
  })
}

function isContentTypeApplicationJSON(contentType: string | undefined) {
  if (typeof contentType !== 'string') return false
  if (!contentType.startsWith('application/json')) return false
  return true
}

/**
 * @deprecated Use `JsonBodySelector`
 */
export const createJsonBodySelector = JsonBodySelector
