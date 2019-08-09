import { buffer } from 'micro'
import { Selector } from '../types'

export interface BufferBodySelectorOptions {
  limit?: string | number
  encoding?: string
}

export function createBufferBodySelector(
  options?: BufferBodySelectorOptions
): Selector<string | Buffer> {
  return ({ req }) => {
    return buffer(req, options)
  }
}
