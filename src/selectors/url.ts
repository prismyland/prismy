import { UrlWithStringQuery, parse } from 'url'
import { SyncSelector } from '../types'

const urlSymbol = Symbol('prismy-url')

/**
 * Selector for extracting the requested URL
 *
 * @example
 * Simple example
 * ```ts
 *
 * const prismyHandler = prismy(
 *  [urlSelector],
 *  url => {
 *    return res(url.path)
 *  }
 * )
 * ```
 *
 * @param context - Request context
 * @returns The url of the request
 *
 * @public
 */
export const urlSelector: SyncSelector<UrlWithStringQuery> = context => {
  let url: UrlWithStringQuery | undefined = context[urlSymbol]
  if (url == null) {
    const { req } = context
    /* istanbul ignore next */
    context[urlSymbol] = url =
      req.url != null ? parse(req.url, false) : { query: null }
  }
  return url
}
