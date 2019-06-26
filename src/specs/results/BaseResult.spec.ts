import got from 'got'
import { BaseResult, Context } from '../..'
import { testServer } from '../testServer'

describe('BaseResult', () => {
  it('can be customized', async () => {
    class CustomResult extends BaseResult {
      handle({ res }: Context) {
        res.end('Hello, World!')
      }
    }
    class MyHandler {
      handle() {
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
