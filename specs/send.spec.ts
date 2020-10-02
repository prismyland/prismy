import got from 'got'
import { RequestListener } from 'http'
import { Readable } from 'stream'
import { send } from '../src/send'
import { testHandler } from './helpers'

describe('send', () => {
  it('sends empty body when data is null', async () => {
    expect.hasAssertions()

    const handler: RequestListener = (req, res) => {
      const statusCode = res.statusCode
      send(res, statusCode)
    }

    await testHandler(handler, async url => {
      const response = await got(url)
      expect(response.body).toBeFalsy()
    })
  })

  it('sends buffer body when data is buffer', async () => {
    expect.hasAssertions()

    const targetBuffer = Buffer.from('Hello, world!')
    const handler: RequestListener = (req, res) => {
      res.setHeader('Content-Type', 'application/octet-stream')
      const statusCode = res.statusCode
      send(res, statusCode, targetBuffer)
    }

    await testHandler(handler, async url => {
      const responsePromise = got(url)
      const bufferPromise = responsePromise.buffer()
      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise
      ])

      expect(targetBuffer.equals(buffer)).toBe(true)
      expect(response.headers['content-length']).toBe(
        targetBuffer.length.toString()
      )
    })
  })

  it('sets header when Content-Type header is not given (buffer)', async () => {
    expect.hasAssertions()

    const targetBuffer = Buffer.from('Hello, world!')
    const handler: RequestListener = (req, res) => {
      const statusCode = res.statusCode
      send(res, statusCode, targetBuffer)
    }

    await testHandler(handler, async url => {
      const responsePromise = got(url)
      const bufferPromise = responsePromise.buffer()
      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise
      ])

      expect(targetBuffer.equals(buffer)).toBe(true)
      expect(response.headers['content-length']).toBe(
        targetBuffer.length.toString()
      )
      expect(response.headers['content-type']).toBe('application/octet-stream')
    })
  })

  it('sends buffer body when data is stream', async () => {
    expect.hasAssertions()

    const targetBuffer = Buffer.from('Hello, world!')
    const stream = Readable.from(targetBuffer.toString())
    const handler: RequestListener = (req, res) => {
      res.setHeader('Content-Type', 'application/octet-stream')
      const statusCode = res.statusCode
      send(res, statusCode, stream)
    }

    await testHandler(handler, async url => {
      const response = await got(url, {
        responseType: 'buffer'
      })
      expect(targetBuffer.equals(response.body)).toBe(true)
    })
  })

  it('sets header when Content-Type header is not given (stream)', async () => {
    expect.hasAssertions()

    const targetBuffer = Buffer.from('Hello, world!')
    const stream = Readable.from(targetBuffer.toString())
    const handler: RequestListener = (req, res) => {
      const statusCode = res.statusCode
      send(res, statusCode, stream)
    }

    await testHandler(handler, async url => {
      const responsePromise = got(url)
      const bufferPromise = responsePromise.buffer()
      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise
      ])
      expect(targetBuffer.equals(buffer)).toBe(true)
      expect(response.headers['content-type']).toBe('application/octet-stream')
    })
  })

  it('sends stringified JSON object when data is object', async () => {
    expect.hasAssertions()

    const target = {
      foo: 'bar'
    }
    const handler: RequestListener = (req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      const statusCode = res.statusCode
      send(res, statusCode, target)
    }

    await testHandler(handler, async url => {
      const response = await got(url, {
        responseType: 'json'
      })
      expect(response.body).toMatchObject(target)
      expect(response.headers['content-length']).toBe(
        JSON.stringify(target).length.toString()
      )
    })
  })

  it('sets header when Content-Type header is not given (object)', async () => {
    expect.hasAssertions()

    const target = {
      foo: 'bar'
    }
    const handler: RequestListener = (req, res) => {
      const statusCode = res.statusCode
      send(res, statusCode, target)
    }

    await testHandler(handler, async url => {
      const response = await got(url, {
        responseType: 'json'
      })
      expect(response.body).toMatchObject(target)
      expect(response.headers['content-length']).toBe(
        JSON.stringify(target).length.toString()
      )
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      )
    })
  })

  it('sends stringified JSON object when data is number', async () => {
    expect.hasAssertions()

    const target = 1004
    const handler: RequestListener = (req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      const statusCode = res.statusCode
      send(res, statusCode, target)
    }

    await testHandler(handler, async url => {
      const response = await got(url)
      const stringifiedTarget = JSON.stringify(target)
      expect(response.body).toBe(stringifiedTarget)
      expect(response.headers['content-length']).toBe(
        stringifiedTarget.length.toString()
      )
    })
  })

  it('sets header when Content-Type header is not given (number)', async () => {
    expect.hasAssertions()

    const target = 1004
    const handler: RequestListener = (req, res) => {
      const statusCode = res.statusCode
      send(res, statusCode, target)
    }

    await testHandler(handler, async url => {
      const response = await got(url)
      const stringifiedTarget = JSON.stringify(target)
      expect(response.body).toBe(stringifiedTarget)
      expect(response.headers['content-length']).toBe(
        stringifiedTarget.length.toString()
      )
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      )
    })
  })
})
