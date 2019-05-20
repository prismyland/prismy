import { injectHeader } from '../../selectors'
import { testServer } from '../testServer'
import got from 'got'

describe('injectHeader', () => {
  it('injects a header value', async () => {
    class MyHandler {
      execute(@injectHeader('x-test') xTest: string) {
        return xTest
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url, {
        headers: {
          'x-test': 'Hello, World!'
        }
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Hello, World!'
      })
    })
  })
})
