import querystring, { ParseOptions, ParsedUrlQuery } from 'querystring'
import { Selector, createInjectDecorators } from '../createInjectDecorators'
import url from 'url'

export type SelectQueryOptions = ParseOptions

export function selectQuery(
  sep?: string,
  eq?: string,
  options?: SelectQueryOptions
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

export function injectQuery(
  sep?: string,
  eq?: string,
  options?: SelectQueryOptions
) {
  return createInjectDecorators(selectQuery(sep, eq, options))
}
