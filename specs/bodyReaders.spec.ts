import got from 'got'
import getRawBody from 'raw-body'
import { Context, createWithErrorHandler, prismy, res } from '../src'
import { readBufferBody, readJsonBody, readTextBody } from '../src/bodyReaders'
import { testHandler } from './helpers'

describe('readBufferBody', () => {
  it('reads buffer body from a request', async () => {
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

  it('returns cached buffer if it is read already', async () => {
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

  it('throws 413 error if the request body is bigger than limits', async () => {
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

  it('throws 400 error if encoding of request body is invalid', async () => {
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


  it ('throws 400 error if the request body is parsed already', async () => {
    expect.hasAssertions()

    const withErrorHandler = createWithErrorHandler({
      json: true,
      silent: true
    })
    const bufferBodySelector = async ({ req }: Context) => {
      const length = req.headers['content-length']
      await getRawBody(req, { limit: '1mb', length })
      const body = await readBufferBody(req)
      return body
    }

    const handler = prismy(
      [bufferBodySelector],
      body => {
        return res(body)
      },
      [withErrorHandler]
    )

    await testHandler(handler, async (url) => {
      const targetBuffer = Buffer.from('Oops!')
      const response = await got(url, {
        throwHttpErrors: false,
        method: 'POST',
        responseType: 'json',
        body: targetBuffer
      })

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        message: `The request has already been drained`
      })
    })
  })
})

describe('readTextBody', () => {
  it('reads text from request body', async () => {
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
})

describe('readJsonBody', () => {
  it('reads and parse JSON from a request body', async () => {
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

  it('throws 400 error if the JSON body is invalid', async () => {
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
