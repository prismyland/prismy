import got from 'got'
import { testServer } from '../testServer'
import { createInjectDecorators, RedirectResult } from '../..'

describe('RedirectResult', () => {
  it('sets statusCode', async () => {
    const StringUrl = createInjectDecorators(req => req.url)
    class MyHandler {
      execute(@StringUrl url: string) {
        return new RedirectResult('https://example.com', {
          statusCode: 301
        })
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url, {
        followRedirect: false
      })
      expect(response).toMatchObject({
        statusCode: 301,
        headers: expect.objectContaining({ location: 'https://example.com' })
      })
    })
  })

  it('sets headers', async () => {
    const injectUrl = createInjectDecorators(req => req.url)
    class MyHandler {
      execute(@injectUrl url: string) {
        return new RedirectResult('https://example.com', {
          headers: [['x-test', 'Hello, World!']]
        })
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url, {
        followRedirect: false
      })
      expect(response).toMatchObject({
        statusCode: 302,
        headers: expect.objectContaining({
          'x-test': 'Hello, World!',
          location: 'https://example.com'
        })
      })
    })
  })
})
