import { Selector, createInjectDecorators } from '../createInjectDecorators'

export function createMethodSelector(): Selector<string | undefined> {
  return (req, res) => {
    return req.method
  }
}

export function Method() {
  return createInjectDecorators(createMethodSelector())
}
