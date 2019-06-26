import got from 'got'
import { Header } from '../../selectors'
import { testServer } from '../testServer'

describe('Header', () => {
  it('injects a header value', async () => {
    class MyHandler {
      handle(@Header('x-test') xTest: string) {
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
