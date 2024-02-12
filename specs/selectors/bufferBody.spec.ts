import got from 'got'
import { testHandler } from '../helpers'
import { BufferBodySelector, prismy, Result } from '../../src'

describe('BufferBodySelector', () => {
  it('creates buffer body selector', async () => {
    const handler = prismy([BufferBodySelector()], (body) => {
      return Result(`${body.constructor.name}: ${body}`)
    })

    await testHandler(handler, async (url) => {
      const response = await got(url, { method: 'POST', body: 'Hello, World!' })

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Buffer: Hello, World!',
      })
    })
  })
})
