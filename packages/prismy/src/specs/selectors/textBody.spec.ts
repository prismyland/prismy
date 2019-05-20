import got from 'got'
import { testServer } from '../testServer'
import { injectTextBody } from '../../'

describe('injectTextBody', () => {
  it('injects parsed text body', async () => {
    let parsedBody: string
    class MyHandler {
      execute(@injectTextBody() body: string) {
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
