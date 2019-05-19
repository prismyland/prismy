import { createSelectDecorators } from '../createSelectDecorators'
import url from 'url'

export function selectParsedUrl(
  parseQueryString?: boolean,
  slashesDenoteHost?: boolean
) {
  return createSelectDecorators((req, res) => {
    if (req.url == null) return {}
    return url.parse(req.url, parseQueryString as any, slashesDenoteHost)
  })
}
