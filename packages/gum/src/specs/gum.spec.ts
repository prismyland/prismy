import http from 'http'
import micro from 'micro'
import listen from 'test-listen'
import got from 'got'
import { gum } from '../'
import { createSelectDecorators } from '../createSelectDecorators'
import { selectTextBody } from '../decorators/selectTextBody'
import { testServer } from './testServer'

describe('gum', () => {
  it('returns micro handler', async () => {
    class MyHandler {
      execute() {
        return 'Hello, World'
      }
    }
    const server = new http.Server(micro(gum(MyHandler)))
    const url = await listen(server)

    try {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Hello, World'
      })
    } catch (error) {
      throw error
    } finally {
      server.close()
    }
  })

  it('selects via a selector', async () => {
    const selectUrl = createSelectDecorators(req => req.url)
    class MyHandler {
      execute(@selectUrl url: string) {
        return url
      }
    }

    testServer(MyHandler, async url => {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 200,
        body: '/'
      })
    })
  })

  it('selects via multiple selectors', async () => {
    const selectUrl = createSelectDecorators(req => req.url)
    class MyHandler {
      execute(@selectUrl url: string, @selectTextBody() textBody: string) {
        return {
          url,
          textBody
        }
      }
    }

    testServer(MyHandler, async url => {
      const response = await got.post(url, {
        body: 'Hello, World!'
      })
      expect(response).toMatchObject({
        statusCode: 200
      })
      expect(JSON.parse(response.body)).toEqual({
        url: '/',
        textBody: 'Hello, World!'
      })
    })
  })
})
