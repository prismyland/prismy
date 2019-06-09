import got from 'got'
import { createInjectDecorators, SendResult } from '../..'
import { testServer } from '../testServer'

describe('SendResult', () => {
  it('sets statusCode', async () => {
    const StringUrl = createInjectDecorators(req => req.url)
    class MyHandler {
      execute(@StringUrl url: string) {
        return new SendResult(url, {
          statusCode: 201
        })
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 201,
        body: '/'
      })
    })
  })

  it('sets headers', async () => {
    const injectUrl = createInjectDecorators(req => req.url)
    class MyHandler {
      execute(@injectUrl url: string) {
        return new SendResult(url, {
          headers: [['x-test', 'Hello, World!']]
        })
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 200,
        body: '/',
        headers: expect.objectContaining({
          'x-test': 'Hello, World!'
        })
      })
    })
  })
})
