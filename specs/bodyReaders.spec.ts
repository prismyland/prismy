import got from 'got'
import { Context, createWithErrorHandler, prismy, res } from '../src'
import { readBufferBody, readTextBody, readJsonBody } from '../src/bodyReaders'
import { testHandler } from './helpers'

describe('readBufferBody', () => {
  it('responds with buffer body', async () => {
    expect.hasAssertions()

    const bufferBodySelector = async (context: Context) => {
      const { req } = context
      const bufferBody = await readBufferBody(req)
      return bufferBody
    }

    const handler = prismy([bufferBodySelector], async body => {
      return res(body)
    })

    await testHandler(handler, async url => {
      const target = Buffer.from('Hello, World')
      const responsePromise = got(url, {
        method: 'POST',
        body: target
      })
      const bufferPromise = responsePromise.buffer()
      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise
      ])

      expect(buffer.equals(target)).toBe(true)
      expect(response.headers['content-length']).toBe(buffer.length.toString())
    })
  })

  it('responds with cached buffer body', async () => {
    expect.hasAssertions()

    const bufferBodySelector = async (context: Context) => {
      const { req } = context
      await readBufferBody(req)
      const bufferBody = await readBufferBody(req)
      return bufferBody
    }

    const handler = prismy([bufferBodySelector], async body => {
      return res(body)
    })

    await testHandler(handler, async url => {
      const target = Buffer.from('Hello, World')
      const responsePromise = got(url, {
        method: 'POST',
        body: target
      })
      const bufferPromise = responsePromise.buffer()
      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise
      ])

      expect(buffer.equals(target)).toBe(true)
      expect(response.headers['content-length']).toBe(buffer.length.toString())
    })
  })

  it('throws 413 error: Body exceeded 1 byte limit', async () => {
    const withErrorHandler = createWithErrorHandler({
      json: true,
      silent: true
    })
    const bufferBodySelector = async (context: Context) => {
      const { req } = context
      const bufferBody = await readBufferBody(req, { limit: '1 byte' })
      return bufferBody
    }

    const handler = prismy(
      [bufferBodySelector],
      async body => {
        return res(body)
      },
      [withErrorHandler]
    )

    await testHandler(handler, async url => {
      const response = await got(url, {
        throwHttpErrors: false,
        responseType: 'json',
        method: 'POST',
        body: Buffer.from('Peter Piper picked a peck of pickled peppers.')
      })

      expect(response.statusCode).toBe(413)
      expect(response.body).toEqual({
        message: 'Body exceeded 1 byte limit'
      })
    })
  })

  it('throws 400 error: Invalid body', async () => {
    const withErrorHandler = createWithErrorHandler({
      json: true,
      silent: true
    })
    const bufferBodySelector = async (context: Context) => {
      const { req } = context
      const bufferBody = await readBufferBody(req, { encoding: 'oopsie' })
      return bufferBody
    }

    const handler = prismy(
      [bufferBodySelector],
      async body => {
        return res(body)
      },
      [withErrorHandler]
    )

    await testHandler(handler, async url => {
      const response = await got(url, {
        throwHttpErrors: false,
        responseType: 'json',
        method: 'POST',
        body: Buffer.from(
          'Please subscribe the Kimbug channel: https://www.youtube.com/c/kimbug'
        )
      })

      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({
        message: 'Invalid body'
      })
    })
  })
})

describe('readTextBody', () => {
  it('responds body in text', async () => {
    expect.hasAssertions()

    const textBodySelector = async (context: Context) => {
      const { req } = context
      const textBody = await readTextBody(req)
      return textBody
    }

    const handler = prismy([textBodySelector], async body => {
      return res(body)
    })

    await testHandler(handler, async url => {
      const response = await got(url, { method: 'POST', body: 'Hello, World' })
      expect(response.body).toBe('Hello, World')
      expect(response.headers['content-length']).toBe(
        'Hello, World'.length.toString()
      )
    })
  })
})

describe('readJsonBody', () => {
  it('responds body in the form of JSON object', async () => {
    expect.hasAssertions()

    const jsonBodySelector = async (context: Context) => {
      const { req } = context
      const jsonBody = await readJsonBody(req)
      return jsonBody
    }

    const handler = prismy([jsonBodySelector], async body => {
      return res(body)
    })

    await testHandler(handler, async url => {
      const targetObject = {
        foo: 'bar'
      }

      const response = await got(url, {
        responseType: 'json',
        method: 'POST',
        json: targetObject
      })
      expect(response.body).toMatchObject(targetObject)
      expect(response.headers['content-length']).toBe(
        JSON.stringify(targetObject).length.toString()
      )
    })
  })

  it('throws 400 error: Invalid JSON', async () => {
    expect.hasAssertions()

    const withErrorHandler = createWithErrorHandler({
      json: true,
      silent: true
    })
    const jsonBodySelector = async (context: Context) => {
      const { req } = context
      const jsonBody = await readJsonBody(req)
      return jsonBody
    }

    const handler = prismy(
      [jsonBodySelector],
      async body => {
        return res(body)
      },
      [withErrorHandler]
    )

    await testHandler(handler, async url => {
      const target = 'Oopsie'
      const response = await got(url, {
        throwHttpErrors: false,
        responseType: 'json',
        method: 'POST',
        body: target
      })

      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({
        message: 'Invalid JSON'
      })
    })
  })
})
