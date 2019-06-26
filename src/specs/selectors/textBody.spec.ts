import got from 'got'
import { TextBody } from '../..'
import { testServer } from '../testServer'

describe('TextBody', () => {
  it('injects parsed text body', async () => {
    let parsedBody: string
    class MyHandler {
      handle(@TextBody() body: string) {
        parsedBody = body
        return body
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url, { body: 'Hello, World!' })

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Hello, World!'
      })
      expect(parsedBody).toBe('Hello, World!')
    })
  })
})
