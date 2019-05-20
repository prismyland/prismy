import { text } from 'micro'
import { Selector, createInjectDecorators } from '../createInjectDecorators'

export interface SelectTextBodyOptions {
  limit?: string | number
  encoding?: string
}

export function selectTextBody(
  options?: SelectTextBodyOptions
): Selector<Promise<string>> {
  return (req, res) => {
    return text(req, options)
  }
}

export function injectTextBody(options?: SelectTextBodyOptions) {
  return createInjectDecorators(selectTextBody(options))
}
