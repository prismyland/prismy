import { IncomingHttpHeaders } from 'http'
import { getPrismyContext } from '../prismy'
import { createPrismySelector, PrismySelector } from './createSelector'

/**
 * A selector to extract the headers of a request
 *
 * @example
 * Simple example
 * ```ts
 *
 * const prismyHandler = prismy(
 *  [headerSelector],
 *  headers => {
 *    ...
 *  }
 * )
 * ```
 *
 * @returns The request headers
 *
 * @public
 */
export const headersSelector: PrismySelector<IncomingHttpHeaders> =
  createPrismySelector(() => {
    const { req } = getPrismyContext()
    return req.headers
  })
