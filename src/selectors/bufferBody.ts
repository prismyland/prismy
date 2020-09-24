import { AsyncSelector, BufferOptions, Context } from '../types'
import { buffer } from '../utils'

/**
 * Options for {@link createBufferBodySelector}
 *
 * @public
 */
export type BufferBodySelectorOptions = BufferOptions

/**
 * Factory function that creates a selector to extract the request body in a buffer
 *
 * @example
 * Simple example
 * ```ts
 *
 * const bufferBodySelector = createBufferBodySelector({
 *  limit: "1mb"
 * })
 *
 * const prismyHandler = prismy(
 *  [bufferBodySelector],
 *  bufferBody => {
 *    ...
 *  }
 * )
 *
 * ```
 *
 * @param options - {@link BufferBodySelectorOptions | Options} for the buffer
 * @returns A selector for extracting request body in a buffer
 *
 * @public
 */
export function createBufferBodySelector(
  options: BufferBodySelectorOptions
): AsyncSelector<string | Buffer> {
  return async (context: Context) => {
    const { req } = context
    return buffer(req, options)
  }
}
