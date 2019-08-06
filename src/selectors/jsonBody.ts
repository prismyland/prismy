import { json, createError } from 'micro'
import { Selector } from '../types'
import { createInjectDecorators } from '../createInjectDecorators'
import { createHeaderSelector } from './header'

export interface JsonBodySelectorOptions {
  skipContentTypeCheck?: boolean
  limit?: string | number
  encoding?: string
}

export function createJsonBodySelector(
  options?: JsonBodySelectorOptions
): Selector<Promise<any>> {
  return context => {
    const { skipContentTypeCheck = false } = options || {}
    if (!skipContentTypeCheck) {
      const contentType = createHeaderSelector('content-type')(context)
      if (!isContentTypeIsApplicationJSON(contentType as string | undefined)) {
        throw createError(
          400,
          `Content type must be application/json. (Current: ${contentType})`
        )
      }
    }
    return json(context.req, options)
  }
}

export function JsonBody(options?: JsonBodySelectorOptions) {
  return createInjectDecorators(createJsonBodySelector(options))
}

function isContentTypeIsApplicationJSON(contentType: string | undefined) {
  if (typeof contentType !== 'string') return false
  if (!contentType.startsWith('application/json')) return false
  return true
}
