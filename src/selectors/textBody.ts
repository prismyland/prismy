import { getPrismyContext } from '../prismy'
import { readTextBody } from '../bodyReaders'
import { createPrismySelector, PrismySelector } from './createSelector'

/**
 * Options for {@link textBodySelector}
 *
 * @public
 */
export interface TextBodySelectorOptions {
  limit?: string | number
  encoding?: string
}

/**
 * Factory function to create a selector to extract the text body from a request
 *
 * @example
 * Simple example
 * ```ts
 *
 * const textBodySelector = createTextBodySelector({
 *  limit: "1mb"
 * })
 *
 * const prismyHandler = prismy(
 *  [textBodySelector],
 *  body => {
 *    ...
 *  }
 * )
 *
 * ```
 *
 * @param options - Options such as limit and encoding
 * @returns a selector for text request bodies
 *
 * @public
 */
export function TextBodySelector(
  options?: TextBodySelectorOptions,
): PrismySelector<string> {
  return createPrismySelector(() => {
    const { req } = getPrismyContext()
    return readTextBody(req, options)
  })
}
