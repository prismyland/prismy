import url, { Url, UrlWithParsedQuery } from 'url'
import { Selector, createInjectDecorators } from '../createInjectDecorators'

export function createUrlSelector(
  parseQueryString: true,
  slashesDenoteHost?: boolean
): Selector<UrlWithParsedQuery>
export function createUrlSelector(
  parseQueryString?: false,
  slashesDenoteHost?: boolean
): Selector<Url>
export function createUrlSelector(
  parseQueryString?: boolean,
  slashesDenoteHost?: boolean
): Selector<Url | UrlWithParsedQuery> {
  return (req, res) => {
    /* istanbul ignore next */
    if (req.url == null) return {}
    return url.parse(req.url, parseQueryString as any, slashesDenoteHost)
  }
}

export function Url(parseQueryString?: boolean, slashesDenoteHost?: boolean) {
  return createInjectDecorators(
    createUrlSelector(parseQueryString as any, slashesDenoteHost)
  )
}
