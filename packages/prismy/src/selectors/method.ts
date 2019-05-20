import { Selector, createInjectDecorators } from '../createInjectDecorators'

export function selectMethod(): Selector<string | undefined> {
  return (req, res) => {
    return req.method
  }
}

export function injectMethod() {
  return createInjectDecorators(selectMethod())
}
