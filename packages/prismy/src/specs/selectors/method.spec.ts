import { injectMethod } from '../../selectors'
import { testServer } from '../testServer'
import got from 'got'

describe('injectMethod', () => {
  it('injects method', async () => {
    class MyHandler {
      execute(@injectMethod() method: string) {
        return method
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url)

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'GET'
      })
    })
  })
})
