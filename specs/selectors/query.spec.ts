import got from 'got'
import { testHandler } from '../helpers'
import { querySelector, prismy, res } from '../../src'

describe('querySelector', () => {
  it('selects query', async () => {
    const handler = prismy([querySelector], (query) => {
      return res(query)
    })

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        searchParams: { message: 'Hello, World!' },
        responseType: 'json',
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: { message: 'Hello, World!' },
      })
    })
  })

  it('reuses parsed query', async () => {
    const handler = prismy([querySelector, querySelector], (query, query2) => {
      return res(JSON.stringify(query === query2))
    })

    await testHandler(handler, async (url) => {
      const response = await got(url)

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'true',
      })
    })
  })
})
