import { UrlWithStringQuery, parse } from 'url'
import { Selector } from '../types'
import { createInjectDecorators } from '../createInjectDecorators'

const urlSymbol = Symbol('prismy-url')

export const urlSelector: Selector<UrlWithStringQuery> = context => {
  let url: UrlWithStringQuery | undefined = context[urlSymbol]
  if (url == null) {
    const { req } = context
    /* istanbul ignore next */
    context[urlSymbol] = url =
      req.url != null ? parse(req.url, false) : { query: null }
  }
  return url
}

export function Url() {
  return createInjectDecorators(urlSelector)
}
