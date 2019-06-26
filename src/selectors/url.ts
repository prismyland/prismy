import { Url, parse } from 'url'
import { Selector } from '../types'
import { createInjectDecorators } from '../createInjectDecorators'

export function createUrlSelector(): Selector<Url> {
  return ({ req }) => {
    /* istanbul ignore next */
    return req.url != null ? parse(req.url) : {}
  }
}

export function Url() {
  return createInjectDecorators(createUrlSelector())
}
