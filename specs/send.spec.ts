import { IncomingMessage, RequestListener, ServerResponse } from 'http'
import { Readable } from 'stream'
import { Result } from '../src'
import { sendPrismyResult } from '../src/send'
import { TestServer } from '../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

describe('send', () => {
  it('sends empty body when body is null', async () => {
    const handler: RequestListener = (req, res) => {
      sendPrismyResult(req, res, Result(null))
    }

    const res = await ts.loadRequestListener(handler).call('/')

    expect(await res.text()).toBe('')
  })

  it('sends string body', async () => {
    const handler: RequestListener = (req, res) => {
      sendPrismyResult(req, res, Result('test'))
    }

    const res = await ts.loadRequestListener(handler).call('/')

    expect(await res.text()).toBe('test')
  })

  it('sends buffer body', async () => {
    const targetBuffer = Buffer.from('Hello, world!')
    const handler: RequestListener = (req, res) => {
      sendPrismyResult(req, res, Result(targetBuffer))
    }

    const res = await ts.loadRequestListener(handler).call('/')

    const resBodyBuffer = Buffer.from(await res.arrayBuffer())
    expect(resBodyBuffer.equals(targetBuffer)).toBeTruthy()
    expect(res.headers.get('content-length')).toBe(
      targetBuffer.length.toString(),
    )
    expect(res.headers.get('content-type')).toBe('application/octet-stream')
  })

  it('sends buffer body when body is stream (lenght is not available)', async () => {
    expect.hasAssertions()

    const targetBuffer = Buffer.from('Hello, world!')
    const stream = Readable.from(targetBuffer.toString())
    const handler: RequestListener = (req, res) => {
      const statusCode = res.statusCode
      sendPrismyResult(req, res, Result(stream, statusCode))
    }

    const res = await ts.loadRequestListener(handler).call('/')

    const resBodyBuffer = Buffer.from(await res.arrayBuffer())
    expect(resBodyBuffer.equals(targetBuffer)).toBeTruthy()
    expect(res.headers.get('content-length')).toBeNull()
    expect(res.headers.get('content-type')).toBe('application/octet-stream')
  })

  it('delegates response handling if body is a function', async () => {
    const sendHandler = (
      _request: IncomingMessage,
      response: ServerResponse,
    ) => {
      response.end('test')
    }
    const handler: RequestListener = (req, res) => {
      sendPrismyResult(req, res, Result(sendHandler))
    }

    const res = await ts.loadRequestListener(handler).call('/')

    expect(await res.text()).toBe('test')
  })

  it('sends stringified JSON object when body is an JSON stringifiable object', async () => {
    const target = {
      foo: 'bar',
    }
    const handler: RequestListener = (req, res) => {
      sendPrismyResult(req, res, Result(target))
    }

    const res = await ts.loadRequestListener(handler).call('/')

    expect(await res.json()).toEqual({
      foo: 'bar',
    })
    expect(res.headers.get('content-type')).toBe(
      'application/json; charset=utf-8',
    )
    expect(res.headers.get('content-length')).toEqual(
      JSON.stringify(target).length.toString(),
    )
  })

  it('sends stringified JSON object when body is number', async () => {
    const target = 777
    const handler: RequestListener = (req, res) => {
      sendPrismyResult(req, res, Result(target))
    }

    const res = await ts.loadRequestListener(handler).call('/')

    expect(await res.json()).toEqual(777)
    expect(res.headers.get('content-type')).toBe(
      'application/json; charset=utf-8',
    )
    expect(res.headers.get('content-length')).toEqual(
      JSON.stringify(target).length.toString(),
    )
  })

  it('sets headers', async () => {
    const handler: RequestListener = (req, res) => {
      sendPrismyResult(
        req,
        res,
        Result(null, 201, {
          test1: 'test value1',
          test2: 'test value2',
        }),
      )
    }
    const res = await ts.loadRequestListener(handler).call('/')
    expect(res.headers.get('test1')).toBe('test value1')
    expect(res.headers.get('test2')).toBe('test value2')
    expect(res.status).toBe(201)
  })
})
