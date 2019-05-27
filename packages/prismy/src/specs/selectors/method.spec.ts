import { Method } from '../../selectors'
import { testServer } from '../testServer'
import got from 'got'

describe('Method', () => {
  it('injects method', async () => {
    class MyHandler {
      execute(@Method() method: string) {
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
