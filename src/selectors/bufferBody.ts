import { buffer } from 'micro'
import { Selector, createInjectDecorators } from '../createInjectDecorators'

export interface SelectBufferBodyOptions {
  limit?: string | number
  encoding?: string
}

export function selectBufferBody(
  options?: SelectBufferBodyOptions
): Selector<Promise<string | Buffer>> {
  return (req, res) => {
    return buffer(req, options)
  }
}

export function BufferBody(options?: SelectBufferBodyOptions) {
  return createInjectDecorators(selectBufferBody(options))
}
