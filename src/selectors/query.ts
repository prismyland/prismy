import { ParsedUrlQuery, parse } from 'querystring'
import { prismyContextStorage } from '../prismy'
import { createPrismySelector, PrismySelector } from './createSelector'
import { urlSelector } from './url'

const querySymbol = Symbol('prismy-query')

/**
 * @deprecated Use SearchParamSelector or SearchParamListSelector.
 * To get all search params, use urlSelector, which resolves WHATWG URL object, and access `url.searchParams`.
 *
 * Selector to extract the parsed query from the request URL.
 * Using `querystring.parse` internally.
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
export const querySelector: PrismySelector<ParsedUrlQuery> =
  createPrismySelector(async () => {
    const context = prismyContextStorage.getStore()!
    let query: ParsedUrlQuery | undefined = context[querySymbol]
    if (query == null) {
      const url = await urlSelector.resolve()
      /* istanbul ignore next */
      context[querySymbol] = query =
        url.search != null ? parse(url.search.slice(1)) : {}
    }
    return query
  })
