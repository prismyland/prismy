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
})
