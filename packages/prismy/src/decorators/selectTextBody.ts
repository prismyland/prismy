import { createSelectDecorators } from '../createSelectDecorators'
import { text } from 'micro'

export function selectTextBody(options?: {
  limit?: string | number
  encoding?: string
}) {
  return createSelectDecorators((req, res) => {
    return text(req, options)
  })
}
