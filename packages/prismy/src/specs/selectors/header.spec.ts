import { Header } from '../../selectors'
import { testServer } from '../testServer'
import got from 'got'

describe('Header', () => {
  it('injects a header value', async () => {
    class MyHandler {
      execute(@Header('x-test') xTest: string) {
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
