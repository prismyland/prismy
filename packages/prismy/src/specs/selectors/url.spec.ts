import got from 'got'
import { UrlObject } from 'url'
import { testServer } from '../testServer'
import { injectUrl } from '../../'

describe('injectUrl', () => {
  it('injects url', async () => {
    class MyHandler {
      execute(@injectUrl() url: UrlObject) {
        return url
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url, {
        json: true
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: expect.objectContaining({
          path: '/'
        })
      })
    })
  })
})
