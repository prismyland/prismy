import { IncomingMessage, ServerResponse } from 'http'
import { readable } from 'is-stream'
import { Stream } from 'stream'
import { ResponseObject } from './types'

/**
 * Function to send data to the client
 *
 * @param request {@link IncomingMessage}
 * @param response {@link ServerResponse}
 * @param ResponseObject
 *
 * @public
 */
export const send = (
  request: IncomingMessage,
  response: ServerResponse,
  resObject:
    | ResponseObject<any>
    | ((request: IncomingMessage, response: ServerResponse) => void)
) => {
  if (typeof resObject === 'function') {
    resObject(request, response)
    return
  }
  const { statusCode = 200, body, headers = [] } = resObject
  Object.entries(headers).forEach(([key, value]) => {
    /* istanbul ignore if */
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

  if (body instanceof Stream || readable(body)) {
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
