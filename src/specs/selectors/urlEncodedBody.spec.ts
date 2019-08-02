import got from 'got'
import { ParsedUrlQuery } from 'querystring'
import { UrlEncodedBody } from '../..'
import { testServer } from '../testServer'

describe('URLEncodedBody', () => {
  it('injects parsed url encoded body', async () => {
    class MyHandler {
      handle(@UrlEncodedBody() body: ParsedUrlQuery) {
        return body
      }
    }

    await testServer(MyHandler, async url => {
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
