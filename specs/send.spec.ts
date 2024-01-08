import got from 'got'
import { IncomingMessage, RequestListener, ServerResponse } from 'http'
import { Readable } from 'stream'
import { Result } from '../src'
import { sendPrismyResult } from '../src/send'
import { testHandler } from './helpers'

describe('send', () => {
  it('sends empty body when body is null', async () => {
    expect.hasAssertions()

    const handler: RequestListener = (req, res) => {
      sendPrismyResult(req, res, Result(null))
    }

    await testHandler(handler, async (url) => {
      const response = await got(url)
      expect(response.body).toBeFalsy()
    })
  })

  it('sends string body', async () => {
    expect.hasAssertions()

    const handler: RequestListener = (req, res) => {
      sendPrismyResult(req, res, Result('test'))
    }

    await testHandler(handler, async (url) => {
      const response = await got(url)
      expect(response.body).toEqual('test')
    })
  })

  it('sends buffer body', async () => {
    expect.hasAssertions()

    const targetBuffer = Buffer.from('Hello, world!')
    const handler: RequestListener = (req, res) => {
      res.setHeader('Content-Type', 'application/octet-stream')
      const statusCode = res.statusCode
      sendPrismyResult(req, res, Result(targetBuffer, statusCode))
    }

    await testHandler(handler, async (url) => {
      const responsePromise = got(url)
      const bufferPromise = responsePromise.buffer()
      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise,
      ])

      expect(targetBuffer.equals(buffer)).toBe(true)
      expect(response.headers['content-length']).toBe(
        targetBuffer.length.toString(),
      )
    })
  })

  it('sets header when Content-Type header is not given (buffer)', async () => {
    expect.hasAssertions()

    const targetBuffer = Buffer.from('Hello, world!')
    const handler: RequestListener = (req, res) => {
      const statusCode = res.statusCode
      sendPrismyResult(req, res, Result(targetBuffer, statusCode))
    }

    await testHandler(handler, async (url) => {
      const responsePromise = got(url)
      const bufferPromise = responsePromise.buffer()
      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise,
      ])

      expect(targetBuffer.equals(buffer)).toBe(true)
      expect(response.headers['content-length']).toBe(
        targetBuffer.length.toString(),
      )
      expect(response.headers['content-type']).toBe('application/octet-stream')
    })
  })

  it('sends buffer body when body is stream', async () => {
    expect.hasAssertions()

    const targetBuffer = Buffer.from('Hello, world!')
    const stream = Readable.from(targetBuffer.toString())
    const handler: RequestListener = (req, res) => {
      res.setHeader('Content-Type', 'application/octet-stream')
      const statusCode = res.statusCode
      sendPrismyResult(req, res, Result(stream, statusCode))
    }

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        responseType: 'buffer',
      })
      expect(targetBuffer.equals(response.body)).toBe(true)
    })
  })

  it('uses handler when body is function', async () => {
    expect.hasAssertions()
    const sendHandler = (
      _request: IncomingMessage,
      response: ServerResponse,
    ) => {
      response.end('test')
    }
    const handler: RequestListener = (req, res) => {
      sendPrismyResult(req, res, Result(sendHandler))
    }

    await testHandler(handler, async (url) => {
      const response = await got(url)
      expect(response.body).toEqual('test')
    })
  })

  it('sets header when Content-Type header is not given (stream)', async () => {
    expect.hasAssertions()

    const targetBuffer = Buffer.from('Hello, world!')
    const stream = Readable.from(targetBuffer.toString())
    const handler: RequestListener = (req, res) => {
      const statusCode = res.statusCode
      sendPrismyResult(req, res, Result(stream, statusCode))
    }

    await testHandler(handler, async (url) => {
      const responsePromise = got(url)
      const bufferPromise = responsePromise.buffer()
      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise,
      ])
      expect(targetBuffer.equals(buffer)).toBe(true)
      expect(response.headers['content-type']).toBe('application/octet-stream')
    })
  })

  it('sends stringified JSON object when body is object', async () => {
    expect.hasAssertions()

    const target = {
      foo: 'bar',
    }
    const handler: RequestListener = (req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      sendPrismyResult(req, res, Result(target))
    }

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        responseType: 'json',
      })
      expect(response.body).toMatchObject(target)
      expect(response.headers['content-length']).toBe(
        JSON.stringify(target).length.toString(),
      )
    })
  })

  it('sets header when Content-Type header is not given (object)', async () => {
    expect.hasAssertions()

    const target = {
      foo: 'bar',
    }
    const handler: RequestListener = (req, res) => {
      sendPrismyResult(req, res, Result(target))
    }

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        responseType: 'json',
      })
      expect(response.body).toMatchObject(target)
      expect(response.headers['content-length']).toBe(
        JSON.stringify(target).length.toString(),
      )
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      )
    })
  })

  it('sends stringified JSON object when body is number', async () => {
    expect.hasAssertions()

    const target = 1004
    const handler: RequestListener = (req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      sendPrismyResult(req, res, Result(target))
    }

    await testHandler(handler, async (url) => {
      const response = await got(url)
      const stringifiedTarget = JSON.stringify(target)
      expect(response.body).toBe(stringifiedTarget)
      expect(response.headers['content-length']).toBe(
        stringifiedTarget.length.toString(),
      )
    })
  })

  it('sets header when Content-Type header is not given (number)', async () => {
    expect.hasAssertions()

    const target = 1004
    const handler: RequestListener = (req, res) => {
      sendPrismyResult(req, res, Result(target))
    }

    await testHandler(handler, async (url) => {
      const response = await got(url)
      const stringifiedTarget = JSON.stringify(target)
      expect(response.body).toBe(stringifiedTarget)
      expect(response.headers['content-length']).toBe(
        stringifiedTarget.length.toString(),
      )
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      )
    })
  })

  it('sends with header', async () => {
    expect.hasAssertions()

    const handler: RequestListener = (req, res) => {
      sendPrismyResult(
        req,
        res,
        Result(null, 200, {
          test: 'test value',
        }),
      )
    }

    await testHandler(handler, async (url) => {
      const response = await got(url)
      expect(response.body).toBeFalsy()
      expect(response.headers['test']).toEqual('test value')
    })
  })
})
