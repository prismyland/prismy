import { Selector } from '../types'
import { createInjectDecorators } from '../createInjectDecorators'

export function createHeaderSelector(
  key: string
): Selector<string | string[] | undefined> {
  return ({ req }) => {
    return req.headers[key]
  }
}

export function Header(key: string) {
  return createInjectDecorators(createHeaderSelector(key))
}
