import got from 'got'
import { BufferBody } from '../..'
import { testServer } from '../testServer'

describe('BufferBody', () => {
  it('injects parsed buffer body', async () => {
    let parsedBody: Buffer
    class MyHandler {
      handle(@BufferBody() body: Buffer) {
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
      expect(parsedBody).toBeInstanceOf(Buffer)
      expect(parsedBody.toString('utf-8')).toBe('Hello, World!')
    })
  })
})
