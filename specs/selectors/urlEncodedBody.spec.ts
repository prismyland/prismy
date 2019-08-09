import got from 'got'
import {
  createUrlEncodedBodySelector,
  prismy,
  res,
  testHandler
} from '../../src'

describe('URLEncodedBody', () => {
  it('injects parsed url encoded body', async () => {
    const urlEncodedBodySelector = createUrlEncodedBodySelector()

    const handler = prismy([urlEncodedBodySelector], body => {
      return res(body)
    })

    await testHandler(handler, async url => {
      const response = await got(url, {
        body: {
          message: 'Hello, World!'
        },
        form: true
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: JSON.stringify({
          message: 'Hello, World!'
        })
      })
    })
  })
})
