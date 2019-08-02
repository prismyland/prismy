import { ParsedUrlQuery, parse } from 'querystring'
import { Selector } from '../types'
import { createInjectDecorators } from '../createInjectDecorators'
import { urlSelector } from './url'

const querySymbol = Symbol('prismy-query')

export const querySelector: Selector<ParsedUrlQuery> = context => {
  let query: ParsedUrlQuery | undefined = context[querySymbol]
  if (query == null) {
    const url = urlSelector(context)
    /* istanbul ignore next */
    context[querySymbol] = query = url.query != null ? parse(url.query) : {}
  }
  return query
}

export function Query() {
  return createInjectDecorators(querySelector)
}
