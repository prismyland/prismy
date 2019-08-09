import got from 'got'
import { contextSelector, prismy, res, testHandler } from '../..'
import { headersSelector } from '../../selectors'

describe('headersSelector', () => {
  it('select headers', async () => {
    const handler = prismy([contextSelector], async context => {
      const headers = await headersSelector(context)
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
