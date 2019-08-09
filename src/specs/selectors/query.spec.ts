import got from 'got'
import { querySelector, prismy, res, testHandler } from '../..'

describe('querySelector', () => {
  it('selects query', async () => {
    const handler = prismy([querySelector], query => {
      return res(query)
    })

    await testHandler(handler, async url => {
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
    const handler = prismy([querySelector, querySelector], (query, query2) => {
      return res(JSON.stringify(query === query2))
    })

    await testHandler(handler, async url => {
      const response = await got(url)

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'true'
      })
    })
  })
})
