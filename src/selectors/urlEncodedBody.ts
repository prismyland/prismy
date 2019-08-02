import { text } from 'micro'
import { ParsedUrlQuery, parse } from 'querystring'
import { Selector } from '../types'
import { createInjectDecorators } from '../createInjectDecorators'

export interface UrlEncodedBodySelectorOptions {
  limit?: string | number
  encoding?: string
}

export function createUrlEncodedBodySelector(
  options?: UrlEncodedBodySelectorOptions
): Selector<Promise<ParsedUrlQuery>> {
  return async ({ req }) => {
    const textBody = await text(req, options)
    return parse(textBody)
  }
}

export function UrlEncodedBody(options?: UrlEncodedBodySelectorOptions) {
  return createInjectDecorators(createUrlEncodedBodySelector(options))
}
