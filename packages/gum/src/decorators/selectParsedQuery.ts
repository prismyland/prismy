import { createSelectDecorators } from '../createSelectDecorators'
import querystring from 'querystring'

export function selectParsedQuery(
  sep?: string,
  eq?: string,
  options?: {
    decodeURIComponent?: (value: string) => string
    maxKeys: number
  }
) {
  return createSelectDecorators((req, res) => {
    if (req.url == null) return {}
    return querystring.parse(req.url, sep, eq, options)
  })
}
