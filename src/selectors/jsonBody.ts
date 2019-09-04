import { json } from 'micro'
import { createError } from '../error'
import { AsyncSelector } from '../types'
import { headersSelector } from './headers'


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
  return context => {
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
    return json(context.req, options)
  }
}

function isContentTypeIsApplicationJSON(contentType: string | undefined) {
  if (typeof contentType !== 'string') return false
  if (!contentType.startsWith('application/json')) return false
  return true
}
