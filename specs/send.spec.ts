import got from 'got'
import { RequestListener } from 'http'
import { Readable } from 'stream'
import send from '../src/send'
import { testHandler } from './helpers'

describe('send', () => {
  it('responds with empty body when body is a nully value', async () => {
    expect.hasAssertions()
    const handler: RequestListener = (req, res) => {
      send(res, 200, null)
    }

    await testHandler(handler, async url => {
      const response = await got(url)
      expect(response.body).toBe('')
    })
  })

  it('responds with buffer when body is buffer', async () => {
    expect.hasAssertions()
    const targetBuffer = Buffer.from('Hello')
    const handler: RequestListener = (req, res) => {
      res.setHeader('Content-Type', 'test')
      send(res, 200, targetBuffer)
    }

    await testHandler(handler, async url => {
      const responsePromise = got(url)
      const bufferPromise = responsePromise.buffer()

      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise
      ])

      expect(buffer.equals(targetBuffer)).toBe(true)
      expect(response.headers['content-type']).toBe('test')
      expect(response.headers['content-length']).toBe(
        targetBuffer.length.toString()
      )
    })
  })

  it('sets content-type if not specified (buffer)', async () => {
    expect.hasAssertions()
    const targetBuffer = Buffer.from('Hello')
    const handler: RequestListener = (req, res) => {
      send(res, 200, targetBuffer)
    }

    await testHandler(handler, async url => {
      const responsePromise = got(url)
      const bufferPromise = responsePromise.buffer()

      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise
      ])

      expect(buffer.equals(targetBuffer)).toBe(true)
      expect(response.headers['content-type']).toBe('application/octet-stream')
      expect(response.headers['content-length']).toBe(
        targetBuffer.length.toString()
      )
    })
  })

  it('responds with buffer when body is stream', async () => {
    expect.hasAssertions()
    const targetBuffer = Buffer.from('Hello')
    const handler: RequestListener = (req, res) => {
      const stream = Readable.from(targetBuffer)
      res.setHeader('Content-Type', 'test')
      send(res, 200, stream)
    }

    await testHandler(handler, async url => {
      const responsePromise = got(url)
      const bufferPromise = responsePromise.buffer()

      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise
      ])

      expect(buffer.equals(targetBuffer)).toBe(true)
      expect(response.headers['content-type']).toBe('test')
    })
  })
  it('sets content-type if not specified (stream)', async () => {
    expect.hasAssertions()
    const targetBuffer = Buffer.from('Hello')
    const handler: RequestListener = (req, res) => {
      const stream = Readable.from(targetBuffer)
      send(res, 200, stream)
    }

    await testHandler(handler, async url => {
      const responsePromise = got(url)
      const bufferPromise = responsePromise.buffer()

      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise
      ])

      expect(buffer.equals(targetBuffer)).toBe(true)
      expect(response.headers['content-type']).toBe('application/octet-stream')
    })
  })

  it('responds with JSON string when body is an object', async () => {
    expect.hasAssertions()
    const target = {
      foo: 'bar'
    }
    const handler: RequestListener = (req, res) => {
      res.setHeader('Content-Type', 'test')
      send(res, 200, target)
    }

    await testHandler(handler, async url => {
      const response = await got(url, { responseType: 'json' })
      expect(response.body).toMatchObject(target)
      expect(response.headers['content-type']).toBe('test')
      expect(response.headers['content-length']).toBe(
        JSON.stringify(target).length.toString()
      )
    })
  })

  it('sets content-type if not specified (object)', async () => {
    expect.hasAssertions()
    const target = {
      foo: 'bar'
    }
    const handler: RequestListener = (req, res) => {
      send(res, 200, target)
    }

    await testHandler(handler, async url => {
      const response = await got(url, { responseType: 'json' })
      expect(response.body).toMatchObject(target)
      expect(response.headers['content-type']).toBe(
        'application/json;charset=utf-8'
      )
      expect(response.headers['content-length']).toBe(
        JSON.stringify(target).length.toString()
      )
    })
  })

  it('responds with JSON string when body is a number', async () => {
    expect.hasAssertions()
    const target = 1234
    const handler: RequestListener = (req, res) => {
      res.setHeader('Content-Type', 'test')
      send(res, 200, target)
    }

    await testHandler(handler, async url => {
      const response = await got(url, { responseType: 'json' })
      expect(response.body).toBe(target)
      expect(response.headers['content-type']).toBe('test')
      expect(response.headers['content-length']).toBe(
        JSON.stringify(target).length.toString()
      )
    })
  })

  it('sets content-type if not specified (number)', async () => {
    expect.hasAssertions()
    const target = 1234
    const handler: RequestListener = (req, res) => {
      send(res, 200, target)
    }

    await testHandler(handler, async url => {
      const response = await got(url, { responseType: 'json' })
      expect(response.body).toBe(target)
      expect(response.headers['content-type']).toBe(
        'application/json;charset=utf-8'
      )
      expect(response.headers['content-length']).toBe(
        JSON.stringify(target).length.toString()
      )
    })
  })

  it('responds with string when body is a string', async () => {
    expect.hasAssertions()
    const target = 'Hello, world!'
    const handler: RequestListener = (req, res) => {
      send(res, 200, target)
    }

    await testHandler(handler, async url => {
      const response = await got(url)
      expect(response.body).toBe(target)
      expect(response.headers['content-length']).toBe(target.length.toString())
    })
  })
})
