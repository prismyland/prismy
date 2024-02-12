import got from 'got'
import { testHandler } from '../helpers'
import { MethodSelector, prismy, Result } from '../../src'

describe('MethodSelector', () => {
  it('selects method', async () => {
    const handler = prismy([MethodSelector()], (method) => {
      return Result(method)
    })

    await testHandler(handler, async (url) => {
      const response = await got(url)

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'GET',
      })
    })
  })
})
