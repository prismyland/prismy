import got from 'got'
import { testHandler } from '../helpers'
import { createUrlEncodedBodySelector, prismy, res } from '../../src'

describe('URLEncodedBody', () => {
  it('injects parsed url encoded body', async () => {
    const urlEncodedBodySelector = createUrlEncodedBodySelector()

    const handler = prismy([urlEncodedBodySelector], body => {
      return res(body)
    })

    await testHandler(handler, async url => {
      const response = await got(url, {
        method: 'POST',
        responseType: 'json',
        form: {
          message: 'Hello, World!'
        }
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: {
          message: 'Hello, World!'
        }
      })
    })
  })
})
