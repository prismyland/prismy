import { ParsedUrlQuery, parse } from 'querystring'
import { Selector } from '../types'
import { createInjectDecorators } from '../createInjectDecorators'
import { createUrlSelector } from './url'

export const querySymbol = Symbol()

export function createQuerySelector(): Selector<ParsedUrlQuery> {
  return context => {
    const url = createUrlSelector()(context)
    /* istanbul ignore next */
    if (url.query == null) return {}

    return parse(url.query as string)
  }
}

export function Query() {
  return createInjectDecorators(createQuerySelector())
}
