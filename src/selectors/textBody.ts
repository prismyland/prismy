import { AsyncSelector } from '../types'
import { createBufferBodySelector } from './bufferBody'

/**
 * Options for {@link createTextBodySelector}
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
export function createTextBodySelector(
  options: TextBodySelectorOptions = {}
): AsyncSelector<string> {
  const bufferBodySelector = createBufferBodySelector(options)
  return async context => {
    const buffer = await bufferBodySelector(context)

    return buffer.toString(options.encoding)
  }
}
