import got from 'got'
import { testHandler } from '../helpers'
import { JsonBodySelector, prismy, Result } from '../../src'

describe('JsonBodySelector', () => {
  it('creates json body selector', async () => {
    const jsonBodySelector = JsonBodySelector()
    const handler = prismy([jsonBodySelector], (body) => {
      return Result(body)
    })

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        method: 'POST',
        responseType: 'json',
        json: {
          message: 'Hello, World!',
        },
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: {
          message: 'Hello, World!',
        },
      })
    })
  })

  it('throw if content typeof a request is not set', async () => {
    const jsonBodySelector = JsonBodySelector()
    const handler = prismy([jsonBodySelector], (body) => {
      return Result(body)
    })

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello, World!',
        }),
        throwHttpErrors: false,
      })

      expect(response).toMatchObject({
        statusCode: 400,
        body: expect.stringContaining(
          'Error: Content type must be application/json. (Current: undefined)',
        ),
      })
    })
  })

  it('throws if content type of a request is not application/json', async () => {
    const jsonBodySelector = JsonBodySelector()
    const handler = prismy([jsonBodySelector], (body) => {
      return Result(body)
    })

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        method: 'POST',
        json: {
          message: 'Hello, World!',
        },
        headers: {
          'content-type': 'text/plain',
        },
        throwHttpErrors: false,
      })

      expect(response).toMatchObject({
        statusCode: 400,
        body: expect.stringContaining(
          'Error: Content type must be application/json. (Current: text/plain)',
        ),
      })
    })
  })
})
