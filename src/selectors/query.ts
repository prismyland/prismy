import querystring, { ParseOptions, ParsedUrlQuery } from 'querystring'
import { Selector, createInjectDecorators } from '../createInjectDecorators'
import url from 'url'

export type QuerySelectorOptions = ParseOptions

export function createQuerySelector(
  sep?: string,
  eq?: string,
  options?: QuerySelectorOptions
): Selector<ParsedUrlQuery> {
  return (req, res) => {
    /* istanbul ignore next */
    if (req.url == null) return {}
    const { query } = url.parse(req.url)
    /* istanbul ignore next */
    if (query == null) return {}
    return querystring.parse(query, sep, eq, options)
  }
}

export function Query(
  sep?: string,
  eq?: string,
  options?: QuerySelectorOptions
) {
  return createInjectDecorators(createQuerySelector(sep, eq, options))
}
