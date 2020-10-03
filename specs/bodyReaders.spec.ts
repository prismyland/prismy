import got from 'got/dist/source'
import { Context, createWithErrorHandler, prismy, res } from '../src'
import { readBufferBody, readJsonBody, readTextBody } from '../src/bodyReaders'
import { testHandler } from './helpers'

describe('readBufferBody', () => {
  it('responds with buffer body', async () => {
    expect.hasAssertions()

    const bufferBodySelector = async ({ req }: Context) => {
      const body = await readBufferBody(req)
      return body
    }
    const handler = prismy([bufferBodySelector], body => {
      return res(body)
    })

    await testHandler(handler, async url => {
      const targetBuffer = Buffer.from('Hello, world!')
      const responsePromise = got(url, {
        method: 'POST',
        body: targetBuffer
      })
      const bufferPromise = responsePromise.buffer()
      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise
      ])

      expect(buffer.equals(targetBuffer)).toBe(true)
      expect(response.headers['content-length']).toBe(
        targetBuffer.length.toString()
      )
    })
  })

  it('responds with cached buffer body', async () => {
    expect.hasAssertions()

    const bufferBodySelector = async ({ req }: Context) => {
      await readBufferBody(req)
      const body = await readBufferBody(req)
      return body
    }
    const handler = prismy([bufferBodySelector], body => {
      return res(body)
    })

    await testHandler(handler, async url => {
      const targetBuffer = Buffer.from('Hello, world!')
      const responsePromise = got(url, {
        method: 'POST',
        body: targetBuffer
      })
      const bufferPromise = responsePromise.buffer()
      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise
      ])

      expect(buffer.equals(targetBuffer)).toBe(true)
      expect(response.headers['content-length']).toBe(
        targetBuffer.length.toString()
      )
    })
  })

  it('throws 413 error', async () => {
    expect.hasAssertions()

    const withErrorHandler = createWithErrorHandler({
      json: true,
      silent: true
    })
    const bufferBodySelector = async ({ req }: Context) => {
      const body = await readBufferBody(req, { limit: '1 byte' })
      return body
    }
    const handler = prismy(
      [bufferBodySelector],
      body => {
        return res(body)
      },
      [withErrorHandler]
    )

    await testHandler(handler, async url => {
      const targetBuffer = Buffer.from(
        'Peter Piper picked a peck of pickled peppers'
      )
      const response = await got(url, {
        throwHttpErrors: false,
        method: 'POST',
        responseType: 'json',
        body: targetBuffer
      })

      expect(response.statusCode).toBe(413)
      expect(response.body).toMatchObject({
        message: `Body exceeded 1 byte limit`
      })
    })
  })

  it('throws 400 error', async () => {
    expect.hasAssertions()

    const withErrorHandler = createWithErrorHandler({
      json: true,
      silent: true
    })
    const bufferBodySelector = async ({ req }: Context) => {
      const body = await readBufferBody(req, { encoding: 'lol' })
      return body
    }
    const handler = prismy(
      [bufferBodySelector],
      body => {
        return res(body)
      },
      [withErrorHandler]
    )

    await testHandler(handler, async url => {
      const targetBuffer = Buffer.from('Hello, world!')
      const response = await got(url, {
        throwHttpErrors: false,
        method: 'POST',
        responseType: 'json',
        body: targetBuffer
      })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        message: `Invalid body`
      })
    })
  })

  it('responds with text body', async () => {
    expect.hasAssertions()

    const textBodySelector = async ({ req }: Context) => {
      const body = await readTextBody(req)
      return body
    }
    const handler = prismy([textBodySelector], body => {
      return res(body)
    })

    await testHandler(handler, async url => {
      const targetBuffer = Buffer.from('Hello, world!')
      const response = await got(url, {
        method: 'POST',
        body: targetBuffer
      })
      expect(response.body).toBe('Hello, world!')
      expect(response.headers['content-length']).toBe(
        targetBuffer.length.toString()
      )
    })
  })

  it('responds with JSON object', async () => {
    expect.hasAssertions()

    const jsonBodySelector = async ({ req }: Context) => {
      const body = await readJsonBody(req)
      return body
    }
    const handler = prismy([jsonBodySelector], body => {
      return res(body)
    })

    await testHandler(handler, async url => {
      const target = {
        foo: 'bar'
      }
      const response = await got(url, {
        method: 'POST',
        responseType: 'json',
        json: target
      })
      expect(response.body).toMatchObject(target)
      expect(response.headers['content-length']).toBe(
        JSON.stringify(target).length.toString()
      )
    })
  })

  it('throws 400 error', async () => {
    expect.hasAssertions()

    const withErrorHandler = createWithErrorHandler({
      json: true,
      silent: true
    })
    const jsonBodySelector = async ({ req }: Context) => {
      const body = await readJsonBody(req)
      return body
    }
    const handler = prismy(
      [jsonBodySelector],
      body => {
        return res(body)
      },
      [withErrorHandler]
    )

    await testHandler(handler, async url => {
      const target = 'Oopsie'
      const response = await got(url, {
        throwHttpErrors: false,
        method: 'POST',
        responseType: 'json',
        body: target
      })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({
        message: `Invalid JSON`
      })
    })
  })
})
