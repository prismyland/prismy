import url, { Url, UrlWithParsedQuery } from 'url'
import { Selector, createInjectDecorators } from '../createInjectDecorators'

export function selectUrl(
  parseQueryString: true,
  slashesDenoteHost?: boolean
): Selector<UrlWithParsedQuery>
export function selectUrl(
  parseQueryString?: false,
  slashesDenoteHost?: boolean
): Selector<Url>
export function selectUrl(
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
    selectUrl(parseQueryString as any, slashesDenoteHost)
  )
}
