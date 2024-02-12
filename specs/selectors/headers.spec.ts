import got from 'got'
import { testHandler } from '../helpers'
import { HeadersSelector, prismy, Result } from '../../src'

describe('headersSelector', () => {
  it('select headers', async () => {
    const handler = prismy([HeadersSelector()], (headers) => {
      return Result(headers['x-test'])
    })

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        headers: {
          'x-test': 'Hello, World!',
        },
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Hello, World!',
      })
    })
  })
})
