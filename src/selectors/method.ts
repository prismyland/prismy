import { getPrismyContext } from '../prismy'
import { createPrismySelector, PrismySelector } from './createSelector'

const methodSelector: PrismySelector<string | undefined> = createPrismySelector(
  () => {
    const { req } = getPrismyContext()
    return req.method
  },
)

/**
 * Returns a selector to extract the HTTP method from the request
 *
 * @example
 * Simple example
 * ```ts
 *
 * const prismyHandler = prismy(
 *  [MethodSelector()],
 *  method => {
 *    if (method !== 'GET') {
 *      throw createError(405)
 *    }
 *  }
 * )
 * ```
 *
 * @returns PrismySelector
 *
 * @public
 */

export function MethodSelector() {
  return methodSelector
}
