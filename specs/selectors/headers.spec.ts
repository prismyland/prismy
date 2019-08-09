import got from 'got'
import { testHandler } from '../testHandler'
import { headersSelector, prismy, res } from '../../src'

describe('headersSelector', () => {
  it('select headers', async () => {
    const handler = prismy([headersSelector], headers => {
      return res(headers['x-test'])
    })

    await testHandler(handler, async url => {
      const response = await got(url, {
        headers: {
          'x-test': 'Hello, World!'
        }
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Hello, World!'
      })
    })
  })
})
