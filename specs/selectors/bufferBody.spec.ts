import got from 'got'
import { createBufferBodySelector, prismy, res, testHandler } from '../../src'

describe('createBufferBodySelector', () => {
  it('creates buffer body selector', async () => {
    const bufferBodySelector = createBufferBodySelector()
    const handler = prismy([bufferBodySelector], body => {
      return res(`${body.constructor.name}: ${body}`)
    })

    await testHandler(handler, async url => {
      const response = await got(url, { body: 'Hello, World!' })

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Buffer: Hello, World!'
      })
    })
  })
})
