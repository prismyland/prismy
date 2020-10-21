import got from 'got'
import { testHandler } from '../helpers'
import { createBodySelector } from '../../src/selectors'
import { prismy, res } from '../../src'

describe('createBodySelector', () => {
  it('returns text body', async () => {
    expect.hasAssertions()
    const bodySelector = createBodySelector()
    const handler = prismy(
      [bodySelector],
      (body) => {
        return res(`${body.constructor.name}: ${body}`)
      }
    )

    await testHandler(handler, async url => {
      const response = await got(url, {
        method: 'POST',
        body: 'Hello, World!'
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: `String: Hello, World!`
      })
    })
  })

  it('returns parsed url encoded body', async () => {
    expect.hasAssertions()
    const bodySelector = createBodySelector()
    const handler = prismy(
      [bodySelector],
      (body) => {
        return res(body)
      }
    )

    await testHandler(handler, async url => {
      const response = await got(url, {
        method: 'POST',
        responseType: 'json',
        form: {
          message: 'Hello, World!'
        }
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: {
          message: 'Hello, World!'
        }
      })
    })
  })

  it('returns JSON object body', async () => {
    expect.hasAssertions()
    const bodySelector = createBodySelector()
    const handler = prismy(
      [bodySelector],
      (body) => {
        return res(body)
      }
    )

    await testHandler(handler, async url => {
      const target = {
        foo: 'bar'
      }
      const response = await got(url, {
        method: 'POST',
        responseType: 'json',
        json: target
      })

      expect(response.statusCode).toBe(200)
      expect(response.body).toMatchObject(target)
    })
  })
})