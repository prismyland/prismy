import { IncomingHttpHeaders } from 'http'
import { getPrismyContext } from '../prismy'
import { createPrismySelector, PrismySelector } from './createSelector'

const headersSelector: PrismySelector<IncomingHttpHeaders> =
  createPrismySelector(() => {
    const { req } = getPrismyContext()
    return req.headers
  })

/**
 * Returns a selector to extract the headers of a request
 *
 * @example
 * Simple example
 * ```ts
 *
 * const prismyHandler = prismy(
 *  [HeaderSelector()],
 *  headers => {
 *    ...
 *  }
 * )
 * ```
 *
 * @returns PrismySelector
 *
 * @public
 */
export function HeadersSelector() {
  return headersSelector
}
