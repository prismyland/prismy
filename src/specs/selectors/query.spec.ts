import got from 'got'
import { Query } from '../..'
import { testServer } from '../testServer'
import { ParsedUrlQuery } from 'querystring'

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

  it('reuses parsed query', async () => {
    class MyHandler {
      handle(@Query() query: ParsedUrlQuery, @Query() query2: ParsedUrlQuery) {
        return JSON.stringify(query === query2)
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url)

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'true'
      })
    })
  })
})
