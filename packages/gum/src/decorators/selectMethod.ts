import { createSelectDecorators } from '../createSelectDecorators'

export function selectMethod(key: string) {
  return createSelectDecorators((req, res) => {
    return req.method
  })
}
