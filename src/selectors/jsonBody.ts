import { json, createError } from 'micro'
import { Selector } from '../types'
import { headersSelector } from './headers'
import { IncomingHttpHeaders } from 'http'

export interface JsonBodySelectorOptions {
  skipContentTypeCheck?: boolean
  limit?: string | number
  encoding?: string
}

export function createJsonBodySelector(
  options?: JsonBodySelectorOptions
): Selector<any> {
  return context => {
    const { skipContentTypeCheck = false } = options || {}
    if (!skipContentTypeCheck) {
      const contentType = (headersSelector(context) as IncomingHttpHeaders)[
        'content-type'
      ]
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
