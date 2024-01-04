import got from 'got'
import { testHandler } from '../helpers'
import { prismy, res, UrlEncodedBodySelector } from '../../src'

describe('URLEncodedBody', () => {
  it('injects parsed url encoded body', async () => {
    const handler = prismy([UrlEncodedBodySelector()], (body) => {
      return res(body)
    })

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        method: 'POST',
        responseType: 'json',
        form: {
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
})
