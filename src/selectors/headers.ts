import { IncomingHttpHeaders } from 'http'
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
 * @param context - The request context
 * @returns The request headers
 * 
 * @public
 */
export const headersSelector: SyncSelector<IncomingHttpHeaders> = context =>
  context.req.headers
