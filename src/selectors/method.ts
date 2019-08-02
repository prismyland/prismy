import { Selector } from '../types'
import { createInjectDecorators } from '../createInjectDecorators'

export const selectMethod: Selector<string | undefined> = ({ req }) => {
  return req.method
}

export function Method() {
  return createInjectDecorators(selectMethod)
}
