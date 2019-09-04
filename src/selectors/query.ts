import { ParsedUrlQuery, parse } from 'querystring'
import { SyncSelector } from '../types'
import { urlSelector } from './url'

const querySymbol = Symbol('prismy-query')

/**
 * Selector to extract the parsed query from the request URL
 * 
 * @example
 * Simple example
 * ```ts
 * 
 * const prismyHandler = prismy(
 *  [querySelector],
 *  query => {
 *    doSomethingWithQuery(query)
 *  }
 * )
 * ```
 * 
 * @param context - Request context
 * @returns a selector for the url query
 * 
 * @public
 */
export const querySelector: SyncSelector<ParsedUrlQuery> = context => {
  let query: ParsedUrlQuery | undefined = context[querySymbol]
  if (query == null) {
    const url = urlSelector(context)
    /* istanbul ignore next */
    context[querySymbol] = query = url.query != null ? parse(url.query) : {}
  }
  return query
}
