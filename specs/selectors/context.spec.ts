import got from 'got'
import { testHandler } from '../helpers'
import { contextSelector, prismy, res, headersSelector } from '../../src'

describe('contextSelector', () => {
  it('select context', async () => {
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
