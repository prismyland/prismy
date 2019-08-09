import { text } from 'micro'
import { AsyncSelector } from '../types'

export interface TextBodySelectorOptions {
  limit?: string | number
  encoding?: string
}

export function createTextBodySelector(
  options?: TextBodySelectorOptions
): AsyncSelector<string> {
  return ({ req }) => {
    return text(req, options)
  }
}
