import { ParsedUrlQuery, parse } from 'querystring'
import { prismyContextStorage } from '../prismy'
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
 * @returns a selector for the url query
 *
 * @public
 */
export const querySelector: SyncSelector<ParsedUrlQuery> = () => {
  const context = prismyContextStorage.getStore()!
  let query: ParsedUrlQuery | undefined = context[querySymbol]
  if (query == null) {
    const url = urlSelector()
    /* istanbul ignore next */
    context[querySymbol] = query = url.search != null ? parse(url.search.slice(1)) : {}
  }
  return query
}
