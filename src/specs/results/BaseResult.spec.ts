import got from 'got'
import { IncomingMessage, ServerResponse } from 'http'
import { BaseResult } from '../..'
import { testServer } from '../testServer'

describe('BaseResult', () => {
  it('can be customized', async () => {
    class CustomResult extends BaseResult {
      execute(req: IncomingMessage, res: ServerResponse) {
        res.end('Hello, World!')
      }
    }
    class MyHandler {
      execute() {
        return new CustomResult()
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Hello, World!'
      })
    })
  })
})
