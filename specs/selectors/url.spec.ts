import got from 'got'
import { testHandler } from '../helpers'
import { prismy, Result, UrlSelector } from '../../src'

describe('UrlSelector', () => {
  it('selects url', async () => {
    const handler = prismy([UrlSelector()], (url) => {
      return Result({
        pathname: url.pathname,
        search: url.search,
      })
    })

    await testHandler(handler, async (url) => {
      const response = await got(url + '/test?query=true#hash', {
        responseType: 'json',
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: expect.objectContaining({
          pathname: '/test',
          search: '?query=true',
        }),
      })
    })
  })

  it('reuses parsed url', async () => {
    const handler = prismy([UrlSelector(), UrlSelector()], (url, url2) => {
      return Result(JSON.stringify(url === url2))
    })

    await testHandler(handler, async (url) => {
      const response = await got(url)

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'true',
      })
    })
  })
})
