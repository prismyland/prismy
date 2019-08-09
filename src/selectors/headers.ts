import { Selector } from '../types'
import { IncomingHttpHeaders } from 'http'

export const headersSelector: Selector<IncomingHttpHeaders> = context =>
  context.req.headers
