import { createError } from '../error'
import { AsyncSelector } from '../types'
import { headersSelector } from './headers'
import { createTextBodySelector } from './textBody'

/**
 * Options for {@link createJsonBodySelector}
 *
 * @public
 */
export interface JsonBodySelectorOptions {
  skipContentTypeCheck?: boolean
  limit?: string | number
  encoding?: string
}

/**
 * Factory function to create a selector to extract the JSON encoded body of a request
 *
 * @example
 * Simple example
 * ```ts
 *
 * const jsonBodySelector = createJsonBodySelector({
 *  limit: "1mb"
 * })
 *
 * const prismyHandler = prismy(
 *  [jsonBodySelector],
 *  body => {
 *    ...
 *  }
 * )
 *
 * ```
 *
 * @param options - {@link JsonBodySelectorOptions | Options} for the body parsing
 * @returns A selector for JSON body requests
 *
 * @throws
 * Throws an Error with 400 if content type is not application/json
 *
 * @public
 */
export function createJsonBodySelector(
  options?: JsonBodySelectorOptions
): AsyncSelector<any> {
  const textBodySelector = createTextBodySelector(options)
  return async context => {
    const { skipContentTypeCheck = false } = options || {}
    if (!skipContentTypeCheck) {
      const contentType = headersSelector(context)['content-type']
      if (!isContentTypeIsApplicationJSON(contentType)) {
        throw createError(
          400,
          `Content type must be application/json. (Current: ${contentType})`
        )
      }
    }
    const text = await textBodySelector(context)

    try {
      return JSON.parse(text)
    } catch (error) {
      throw createError(400, 'Invalid JSON', error)
    }
  }
}

function isContentTypeIsApplicationJSON(contentType: string | undefined) {
  if (typeof contentType !== 'string') return false
  if (!contentType.startsWith('application/json')) return false
  return true
}
