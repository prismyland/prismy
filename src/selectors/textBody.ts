import { text } from 'micro'
import { Selector, createInjectDecorators } from '../createInjectDecorators'

export interface TextBodySelectorOptions {
  limit?: string | number
  encoding?: string
}

export function createTextBodySelector(
  options?: TextBodySelectorOptions
): Selector<Promise<string>> {
  return (req, res) => {
    return text(req, options)
  }
}

export function TextBody(options?: TextBodySelectorOptions) {
  return createInjectDecorators(createTextBodySelector(options))
}
