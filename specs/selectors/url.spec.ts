import got from 'got'
import { testHandler } from '../helpers'
import { urlSelector, prismy, res } from '../../src'

describe('urlSelector', () => {
  it('selects url', async () => {
    const handler = prismy([urlSelector], url => {
      return res(url)
    })

    await testHandler(handler, async url => {
      const response = await got(url, {
        responseType: 'json'
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: expect.objectContaining({
          path: '/'
        })
      })
    })
  })

  it('reuses parsed url', async () => {
    const handler = prismy([urlSelector, urlSelector], (url, url2) => {
      return res(JSON.stringify(url === url2))
    })

    await testHandler(handler, async url => {
      const response = await got(url)

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'true'
      })
    })
  })
})
