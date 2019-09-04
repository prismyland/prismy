import { Context, SyncSelector } from '../types'

/**
 * Selector to extract the request context
 * 
 * @example
 * Simple example
 * ```ts
 * 
 * const prismyHandler = prismy(
 *  [contextSelector],
 *  context => {
 *    ...
 *  }
 * )
 * ```
 * 
 * @param context - The request context
 * @returns The request context
 * 
 * @public
 */
export const contextSelector: SyncSelector<Context> = context => context
