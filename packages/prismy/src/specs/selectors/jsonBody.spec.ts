import { injectJsonBody } from '../../selectors'
import { testServer } from '../testServer'
import got from 'got'

describe('injectJsonBody', () => {
  it('injects parsed json body', async () => {
    class MyHandler {
      execute(@injectJsonBody() body: any) {
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
