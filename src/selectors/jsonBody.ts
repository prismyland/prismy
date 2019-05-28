import { json } from 'micro'
import { Selector, createInjectDecorators } from '../createInjectDecorators'

export interface JsonBodySelectorOptions {
  limit?: string | number
  encoding?: string
}

export function createJsonBodySelector(
  options?: JsonBodySelectorOptions
): Selector<Promise<any>> {
  return (req, res) => {
    return json(req, options)
  }
}

export function JsonBody(options?: JsonBodySelectorOptions) {
  return createInjectDecorators(createJsonBodySelector(options))
}
