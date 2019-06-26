import { Selector } from '../types'
import { createInjectDecorators } from '../createInjectDecorators'

export function createMethodSelector(): Selector<string | undefined> {
  return ({ req }) => {
    return req.method
  }
}

export function Method() {
  return createInjectDecorators(createMethodSelector())
}
