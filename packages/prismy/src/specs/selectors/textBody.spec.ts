import got from 'got'
import { testServer } from '../testServer'
import { TextBody } from '../../'

describe('TextBody', () => {
  it('injects parsed text body', async () => {
    let parsedBody: string
    class MyHandler {
      execute(@TextBody() body: string) {
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
