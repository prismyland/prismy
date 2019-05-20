import { createSelectDecorators } from '../createSelectDecorators'
import { json } from 'micro'

export function selectJSONBody(options?: {
  limit?: string | number
  encoding?: string
}) {
  return createSelectDecorators((req, res) => {
    return json(req, options)
  })
}
