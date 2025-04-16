import { IncomingMessage, ServerResponse } from 'http'
import { Stream } from 'stream'
import { PrismyResult } from './result'

/**
 * Function to send data to the client
 *
 * @param request {@link IncomingMessage}
 * @param response {@link ServerResponse}
 * @param ResponseObject
 *
 * @public
 */
export const sendPrismyResult = async (
  request: IncomingMessage,
  response: ServerResponse,
  sendable: PrismyResult<any>,
) => {
  if (typeof sendable.body === 'function') {
    sendable.body(request, response)
    return
  }
  const { statusCode, body, headers } = sendable
  Object.entries(headers).forEach(([key, value]) => {
    /* v8 ignore next 3 */
    if (value == null) {
      return
    }
    response.setHeader(key, value)
  })
  response.statusCode = statusCode

  if (body == null) {
    response.end()
    return
  }

  if (Buffer.isBuffer(body)) {
    if (!response.getHeader('Content-Type')) {
      response.setHeader('Content-Type', 'application/octet-stream')
    }

    response.setHeader('Content-Length', body.length)
    response.end(body)
    return
  }

  const isReadableStream = await resolveIsReadableStream()
  if (body instanceof Stream || isReadableStream(body)) {
    if (!response.getHeader('Content-Type')) {
      response.setHeader('Content-Type', 'application/octet-stream')
    }

    body.pipe(response)
    return
  }

  const bodyIsNotString = typeof body === 'object' || typeof body === 'number'
  if (bodyIsNotString) {
    if (!response.getHeader('Content-Type')) {
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
    }
  }

  const stringifiedBody = bodyIsNotString
    ? JSON.stringify(body)
    : body.toString()

  response.setHeader('Content-Length', Buffer.byteLength(stringifiedBody))
  response.end(stringifiedBody)
}

let isReadableStream: (stream: any) => boolean
async function resolveIsReadableStream() {
  if (isReadableStream == null) {
    isReadableStream = (await import('is-stream')).isReadableStream
  }
  return isReadableStream
}
