import { SyncSelector } from '../types'

/**
 * Selector to extract the HTTP method from the request
 *
 * @example
 * Simple example
 * ```ts
 *
 * const prismyHandler = prismy(
 *  [methodSelector],
 *  method => {
 *    if (method !== 'GET') {
 *      throw createError(405)
 *    }
 *  }
 * )
 * ```
 *
 * @param context - The request context
 * @returns the http request method
 *
 * @public
 */
export const methodSelector: SyncSelector<string | undefined> = ({ req }) => {
  return req.method
}
