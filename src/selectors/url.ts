import { URL } from 'url'
import { getPrismyContext } from '../prismy'
import { createPrismySelector } from './createSelector'

const urlMap = new WeakMap()

const urlSelector = createPrismySelector((): URL => {
  const context = getPrismyContext()
  let url: URL | undefined = urlMap.get(context)
  if (url == null) {
    const { req } = context
    /* istanbul ignore next */
    url = new URL(req.url == null ? '' : req.url, `http://${req.headers.host}`)
    urlMap.set(context, url)
  }
  return url
})

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
 *    return Result(url.path)
 *  }
 * )
 * ```
 *
 * @returns The url of the request
 *
 * @public
 */
export function UrlSelector() {
  return urlSelector
}
