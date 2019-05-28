import { Selector, createInjectDecorators } from '../createInjectDecorators'

export function createHeaderSelector(
  key: string
): Selector<string | string[] | undefined> {
  return (req, res) => {
    return req.headers[key]
  }
}

export function Header(key: string) {
  return createInjectDecorators(createHeaderSelector(key))
}
