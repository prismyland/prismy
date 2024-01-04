import got from 'got'
import { testHandler } from '../helpers'
import { prismy, res, TextBodySelector } from '../../src'

describe('createTextBodySelector', () => {
  it('creates buffer body selector', async () => {
    const handler = prismy([TextBodySelector()], (body) => {
      return res(`${body.constructor.name}: ${body}`)
    })

    await testHandler(handler, async (url) => {
      const response = await got(url, { method: 'POST', body: 'Hello, World!' })

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'String: Hello, World!',
      })
    })
  })
})
