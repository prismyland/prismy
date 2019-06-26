import got from 'got'
import { Query } from '../..'
import { testServer } from '../testServer'

describe('Query', () => {
  it('injects query', async () => {
    class MyHandler {
      handle(@Query() query: any) {
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
