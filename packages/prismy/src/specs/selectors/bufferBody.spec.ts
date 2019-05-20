import got from 'got'
import { testServer } from '../testServer'
import { injectBufferBody } from '../../'

describe('injectBufferBody', () => {
  it('injects parsed buffer body', async () => {
    let parsedBody: Buffer
    class MyHandler {
      execute(@injectBufferBody() body: Buffer) {
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
