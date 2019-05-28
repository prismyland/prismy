import { json } from 'micro'
import { Selector, createInjectDecorators } from '../createInjectDecorators'

export interface SelectJsonBodyOptions {
  limit?: string | number
  encoding?: string
}

export function selectJsonBody(
  options?: SelectJsonBodyOptions
): Selector<Promise<any>> {
  return (req, res) => {
    return json(req, options)
  }
}

export function JsonBody(options?: SelectJsonBodyOptions) {
  return createInjectDecorators(selectJsonBody(options))
}
