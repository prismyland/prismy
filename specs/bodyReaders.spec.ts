import got from 'got'
import { Context } from 'vm'
import { createWithErrorHandler, prismy, res } from '../src'
import { readBufferBody, readTextBody, readJsonBody } from '../src/bodyReaders'
import { testHandler } from './helpers'

describe('readBufferBody', () => {
  it('responds with buffer', async () => {
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
      const target = Buffer.from('Hello')
      const responsePromise = got(url, { method: 'POST', body: target })
      const bufferPromise = responsePromise.buffer()
      const [response, buffer] = await Promise.all([
        responsePromise,
        bufferPromise
      ])

      expect(buffer.equals(target)).toBe(true)
      expect(response.headers['content-length']).toBe(buffer.length.toString())
    })
  })

  it('throws 413 error: Body exceeded 1byte limit', async () => {
    const withErrorHandler = createWithErrorHandler({
      json: true,
      silent: true
    })
    const bufferBodySelector = async (context: Context) => {
      const { req } = context
      const bufferBody = await readBufferBody(req, { limit: '1byte' })
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
        body: Buffer.from('Form follows function.')
      })

      expect(response.statusCode).toBe(413)
      expect(response.body).toEqual({
        message: 'Body exceeded 1byte limit'
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
      const bufferBody = await readBufferBody(req)
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
        body: `????????`
      })

      // expect(response.statusCode).toBe(400)
      expect(response.body).toBe({
        message: 'Invalid body'
      })
    })
  })
})

describe('readTextBody', () => {
  it('responds with string', async () => {
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
  it('responds with JSON object', async () => {
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
      const jsonObject = {
        foo: 'bar'
      }

      const response = await got(url, {
        method: 'POST',
        json: jsonObject,
        responseType: 'json'
      })
      expect(response.body).toMatchObject(jsonObject)
      expect(response.headers['content-length']).toBe(
        JSON.stringify(jsonObject).length.toString()
      )
    })
  })
})
