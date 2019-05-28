import { json } from 'micro'
import { Selector, createInjectDecorators } from '../createInjectDecorators'

export interface JsonBodySelectorOptions {
  limit?: string | number
  encoding?: string
}

export function selectJsonBody(
  options?: JsonBodySelectorOptions
): Selector<Promise<any>> {
  return (req, res) => {
    return json(req, options)
  }
}

export function JsonBody(options?: JsonBodySelectorOptions) {
  return createInjectDecorators(selectJsonBody(options))
}
