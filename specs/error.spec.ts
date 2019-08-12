import got from 'got'
import { testHandler } from './helpers'
import { prismy, createWithErrorHandler, createError } from '../src'

describe('createWithErrorHandler', () => {
  it('creates withErrorHandler middleware', async () => {
    const withErrorHandler = createWithErrorHandler()
    const handler = prismy(
      [],
      () => {
        throw new Error()
      },
      [withErrorHandler]
    )

    await testHandler(handler, async url => {
      const response = await got(url, {
        throwHttpErrors: false
      })

      expect(response.body).toBe('Internal Server Error')
    })
  })

  it('sends error message if statusCode exists', async () => {
    const withErrorHandler = createWithErrorHandler()
    const handler = prismy(
      [],
      () => {
        throw createError(418, 'I am a teapot')
      },
      [withErrorHandler]
    )

    await testHandler(handler, async url => {
      const response = await got(url, {
        throwHttpErrors: false
      })

      expect(response.statusCode).toBe(418)
      expect(response.body).toBe('I am a teapot')
    })
  })

  it('sends error message if status exists', async () => {
    const withErrorHandler = createWithErrorHandler()
    const handler = prismy(
      [],
      () => {
        const error: any = new Error('I am a teapot')
        error.status = 418
        throw error
      },
      [withErrorHandler]
    )

    await testHandler(handler, async url => {
      const response = await got(url, {
        throwHttpErrors: false
      })

      expect(response.statusCode).toBe(418)
      expect(response.body).toBe('I am a teapot')
    })
  })

  it('sends error stack if dev mode is on', async () => {
    const withErrorHandler = createWithErrorHandler({ dev: true })
    const handler = prismy(
      [],
      () => {
        throw createError(418, 'I am a teapot')
      },
      [withErrorHandler]
    )

    await testHandler(handler, async url => {
      const response = await got(url, {
        throwHttpErrors: false
      })

      expect(response.statusCode).toBe(418)
      expect(response.body).toEqual(
        expect.stringContaining('Error: I am a teapot')
      )
    })
  })

  it('sends json if json mode is on', async () => {
    const withErrorHandler = createWithErrorHandler({ json: true })
    const handler = prismy(
      [],
      () => {
        throw new Error()
      },
      [withErrorHandler]
    )

    await testHandler(handler, async url => {
      const response = await got(url, {
        throwHttpErrors: false,
        json: true
      })

      expect(response.body).toEqual({
        message: 'Internal Server Error'
      })
    })
  })
})
