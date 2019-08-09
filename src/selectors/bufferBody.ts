import { buffer } from 'micro'
import { AsyncSelector } from '../types'

export interface BufferBodySelectorOptions {
  limit?: string | number
  encoding?: string
}

export function createBufferBodySelector(
  options?: BufferBodySelectorOptions
): AsyncSelector<string | Buffer> {
  return ({ req }) => {
    return buffer(req, options)
  }
}
