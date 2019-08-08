import { IncomingHttpHeaders } from 'http'

export interface ResponseObject<B> {
  body?: B
  statusCode: number
  headers: IncomingHttpHeaders
}

export function res<B = unknown>(
  body: B,
  statusCode: number = 200,
  headers: IncomingHttpHeaders = {}
): ResponseObject<B> {
  return {
    body,
    statusCode,
    headers
  }
}
