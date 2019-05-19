import { createSelectDecorators } from '../createSelectDecorators'

export function selectHeader(key: string) {
  return createSelectDecorators((req, res) => {
    return req[key]
  })
}
