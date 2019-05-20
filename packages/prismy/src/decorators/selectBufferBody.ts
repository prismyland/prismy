import { createSelectDecorators } from '../createSelectDecorators'
import { buffer } from 'micro'

export function selectBufferBody(options?: {
  limit?: string | number
  encoding?: string
}) {
  return createSelectDecorators((req, res) => {
    return buffer(req, options)
  })
}
