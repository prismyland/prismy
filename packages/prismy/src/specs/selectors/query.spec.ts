import { injectQuery } from '../../selectors'
import { testServer } from '../testServer'
import got from 'got'

describe('injectQuery', () => {
  it('injects query', async () => {
    class MyHandler {
      execute(@injectQuery() query: any) {
        return query
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url, {
        query: { message: 'Hello, World!' },
        json: true
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: { message: 'Hello, World!' }
      })
    })
  })
})
