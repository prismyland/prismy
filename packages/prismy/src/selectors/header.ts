import { Selector, createInjectDecorators } from '../createInjectDecorators'

export function selectHeader(
  key: string
): Selector<string | string[] | undefined> {
  return (req, res) => {
    return req.headers[key]
  }
}

export function injectHeader(key: string) {
  return createInjectDecorators(selectHeader(key))
}
