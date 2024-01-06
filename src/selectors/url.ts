import { URL } from 'url'
import { getPrismyContext } from '../prismy'
import { createPrismySelector } from './createSelector'

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
 * @returns The url of the request
 *
 * @public
 */
export const urlSelector = createPrismySelector((): URL => {
  const context = getPrismyContext()
  let url: URL | undefined = context[urlSymbol]
  if (url == null) {
    const { req } = context
    /* istanbul ignore next */
    url = context[urlSymbol] = new URL(
      req.url == null ? '' : req.url,
      `http://${req.headers.host}`,
    )
  }
  return url
})
