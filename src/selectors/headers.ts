import { IncomingHttpHeaders } from 'http'
import { SyncSelector } from '../types'

export const headersSelector: SyncSelector<IncomingHttpHeaders> = context =>
  context.req.headers
