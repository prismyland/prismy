import { text } from 'micro'
import { Selector } from '../types'

export interface TextBodySelectorOptions {
  limit?: string | number
  encoding?: string
}

export function createTextBodySelector(
  options?: TextBodySelectorOptions
): Selector<string> {
  return ({ req }) => {
    return text(req, options)
  }
}
