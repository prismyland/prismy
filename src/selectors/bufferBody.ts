import { buffer } from 'micro'
import { Selector } from '../types'
import { createInjectDecorators } from '../createInjectDecorators'

export interface BufferBodySelectorOptions {
  limit?: string | number
  encoding?: string
}

export function createBufferBodySelector(
  options?: BufferBodySelectorOptions
): Selector<Promise<string | Buffer>> {
  return ({ req }) => {
    return buffer(req, options)
  }
}

export function BufferBody(options?: BufferBodySelectorOptions) {
  return createInjectDecorators(createBufferBodySelector(options))
}
