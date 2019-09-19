import { AsyncSelector } from '../types'
import contentType from 'content-type'
import { headersSelector } from './headers'
import { createBufferBodySelector } from './bufferBody'
import { createJsonBodySelector } from './jsonBody'
import { createUrlEncodedBodySelector } from './urlEncodedBody'
import { createTextBodySelector } from './textBody'

const defaultOptions = {
  limit: '1mb'
}

const defaultBufferBodySelector = createBufferBodySelector(defaultOptions)
const defaultJsonBodySelector = createJsonBodySelector(defaultOptions)
const defaultUrlEncodedBodySelector = createUrlEncodedBodySelector(
  defaultOptions
)
const defaultTextBodySelector = createTextBodySelector(defaultOptions)

export const bodySelector: AsyncSelector<any> = async context => {
  const body = (context.req as any).body
  if (body != undefined) return body

  const type = headersSelector(context)['content-type'] || 'text/plain'

  const parsedType = contentType.parse(type)
  switch (parsedType.type) {
    case 'application/octet-stream':
      return defaultBufferBodySelector(context)
    case 'application/json':
      return defaultJsonBodySelector(context)
    case 'application/x-www-form-urlencoded':
      return defaultUrlEncodedBodySelector(context)
    case 'text/plain':
    default:
      return defaultTextBodySelector(context)
  }
}
