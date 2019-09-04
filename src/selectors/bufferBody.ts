import { buffer } from 'micro'
import { AsyncSelector } from '../types'

/**
 * Options for {@link createBufferBodySelector}
 * 
 * @public
 */
export interface BufferBodySelectorOptions {
  limit?: string | number
  encoding?: string
}

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
  options?: BufferBodySelectorOptions
): AsyncSelector<string | Buffer> {
  return ({ req }) => {
    return buffer(req, options)
  }
}
