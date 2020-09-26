import { ServerResponse } from 'http'
import { readable as isReadableStream } from 'is-stream'
import { Stream } from 'stream'

/**
 * Tells server that all of the response headers and body have been sent
 *
 * @param res - {@link ServerResponse | response}
 * @param statusCode - HTTP status code of the response
 * @param body - Data to send
 * @returns Promise<void>
 *
 * @public
 */
export default function send(
  res: ServerResponse,
  statusCode: number,
  body?: any
) {
  res.statusCode = statusCode

  if (body === null) {
    res.end()
    return
  }

  if (Buffer.isBuffer(body)) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/octet-stream')
    }
    res.setHeader('Content-Length', body.length)
    res.end(body)
    return
  }

  if (body instanceof Stream || isReadableStream(body)) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/octet-stream')
    }
    body.pipe(res)
    return
  }

  let str = body

  if (typeof body === 'object' || typeof body === 'number') {
    str = JSON.stringify(body)
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json;charset=utf-8')
    }
  }

  res.setHeader('Content-Length', Buffer.byteLength(str))
  res.end(str)
}
