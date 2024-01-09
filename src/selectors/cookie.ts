import cookie from 'cookie'
import { getPrismyContext } from '../prismy'
import { createPrismySelector } from './createSelector'

const cookieMap = new WeakMap()

export function CookieSelector(key: string) {
  return createPrismySelector((): string | null => {
    const context = getPrismyContext()
    let parsedCookie: { [key: string]: string | undefined } =
      cookieMap.get(context)
    if (parsedCookie == null) {
      const { req } = context
      parsedCookie =
        req.headers['cookie'] != null ? cookie.parse(req.headers['cookie']) : {}
      cookieMap.set(context, parsedCookie)
    }

    const cookieValue = parsedCookie[key]

    return cookieValue != null ? cookieValue : null
  })
}
