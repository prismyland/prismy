import got from 'got'
import { JsonBody } from '../..'
import { testServer } from '../testServer'

describe('JsonBody', () => {
  it('injects parsed json body', async () => {
    class MyHandler {
      handle(@JsonBody() body: any) {
        return body
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url, {
        body: {
          message: 'Hello, World!'
        },
        json: true
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: {
          message: 'Hello, World!'
        }
      })
    })
  })

  it('throws when content-type is not application/json', async () => {
    class MyHandler {
      handle(@JsonBody() body: any) {
        return body
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url, {
        body: JSON.stringify({
          message: 'Hello, World!'
        }),
        headers: {
          'content-type': 'text/plain'
        },
        throwHttpErrors: false
      })

      expect(response).toMatchObject({
        statusCode: 400,
        body: 'Content type must be application/json. (Current: text/plain)'
      })
    })
  })

  it('skip content-type checking', async () => {
    class MyHandler {
      handle(
        @JsonBody({
          skipContentTypeCheck: true
        })
        body: any
      ) {
        return body
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url, {
        body: JSON.stringify({
          message: 'Hello, World!'
        }),
        headers: {
          'content-type': 'text/plain'
        }
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
