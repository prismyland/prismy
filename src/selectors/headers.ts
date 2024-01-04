import { IncomingHttpHeaders } from 'http'
import { getPrismyContext } from '../prismy'
import { SyncSelector } from '../types'

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
export const headersSelector: SyncSelector<IncomingHttpHeaders> = () => {
  const { req } = getPrismyContext()
  return req.headers
}
