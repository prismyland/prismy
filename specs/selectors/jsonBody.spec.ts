import got from 'got'
import { testHandler } from '../helpers'
import { createJsonBodySelector, prismy, res } from '../../src'

describe('createJsonBodySelector', () => {
  it('creates json body selector', async () => {
    const jsonBodySelector = createJsonBodySelector()
    const handler = prismy([jsonBodySelector], body => {
      return res(body)
    })

    await testHandler(handler, async url => {
      const response = await got(url, {
        body: {
          message: 'Hello, World!'
        },
        json: true
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: {
          message: 'Hello, World!'
        }
      })
    })
  })

  it('throws if content type of a request is not application/json #1 (Anti CSRF)', async () => {
    const jsonBodySelector = createJsonBodySelector()
    const handler = prismy([jsonBodySelector], body => {
      return res(body)
    })

    await testHandler(handler, async url => {
      const response = await got(url, {
        body: JSON.stringify({
          message: 'Hello, World!'
        }),
        throwHttpErrors: false
      })

      expect(response).toMatchObject({
        statusCode: 500,
        body:
          'Unhandled Error: Content type must be application/json. (Current: undefined)'
      })
    })
  })

  it('throws if content type of a request is not application/json #2 (Anti CSRF)', async () => {
    const jsonBodySelector = createJsonBodySelector()
    const handler = prismy([jsonBodySelector], body => {
      return res(body)
    })

    await testHandler(handler, async url => {
      const response = await got(url, {
        body: JSON.stringify({
          message: 'Hello, World!'
        }),
        headers: {
          'content-type': 'text/plain'
        },
        throwHttpErrors: false
      })

      expect(response).toMatchObject({
        statusCode: 500,
        body:
          'Unhandled Error: Content type must be application/json. (Current: text/plain)'
      })
    })
  })

  it('skips content-type checking if the option is given', async () => {
    const jsonBodySelector = createJsonBodySelector({
      skipContentTypeCheck: true
    })
    const handler = prismy([jsonBodySelector], body => {
      return res(body)
    })

    await testHandler(handler, async url => {
      const response = await got(url, {
        body: JSON.stringify({
          message: 'Hello, World!'
        }),
        headers: {
          'content-type': 'text/plain'
        }
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: JSON.stringify({
          message: 'Hello, World!'
        })
      })
    })
  })
})
