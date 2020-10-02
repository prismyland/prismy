import { ServerResponse } from 'http'
import { readable } from 'is-stream'
import { Stream } from 'stream'

export const send = (
  res: ServerResponse,
  statusCode: number,
  data: any = null
) => {
  res.statusCode = statusCode

  if (data === null) {
    res.end()
    return
  }

  if (Buffer.isBuffer(data)) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/octet-stream')
    }

    res.setHeader('Content-Length', data.length)
    res.end(data)
    return
  }

  if (data instanceof Stream || readable(data)) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/octet-stream')
    }

    data.pipe(res)
    return
  }

  let str = data

  if (typeof data === 'object' || typeof data === 'number') {
    str = JSON.stringify(data)

    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
    }
  }

  res.setHeader('Content-Length', Buffer.byteLength(str))
  res.end(str)
}
