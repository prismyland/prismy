import { prismy, Redirect, Result } from '../src'
import { testFetch, testHandler } from './helpers'

// TODO: Implement tests
describe('PrismyResult', () => {})

describe('ErrorResult', () => {})

describe('PrismySendResult', () => {
  describe('#setStatusCode', () => {
    it('sets status code', async () => {
      const handler = prismy([], () =>
        Result('Hello, World!').setStatusCode(201),
      )

      await testHandler(handler, async (url) => {
        const response = await testFetch(url)

        expect(response).toMatchObject({
          statusCode: 201,
          body: 'Hello, World!',
        })
      })
    })
  })

  describe('#updateHeaders', () => {
    it('adds headers', async () => {
      const handler = prismy([], () =>
        Result('Hello, World!', 200, {
          'existing-header': 'Hello',
        }).updateHeaders({
          'new-header': 'Hola',
        }),
      )

      await testHandler(handler, async (url) => {
        const response = await testFetch(url)

        expect(response).toMatchObject({
          statusCode: 200,
          body: 'Hello, World!',
        })
        expect(response.headers.get('existing-header')).toBe('Hello')
        expect(response.headers.get('new-header')).toBe('Hola')
      })
    })

    it('replaces existing headers if duplicated, but other headers are still intact', async () => {
      const handler = prismy([], () =>
        Result('Hello, World!', 200, {
          'existing-header': 'Hello',
          'other-existing-header': 'World',
        }).updateHeaders({
          'existing-header': 'Hola',
        }),
      )

      await testHandler(handler, async (url) => {
        const response = await testFetch(url)

        expect(response).toMatchObject({
          statusCode: 200,
          body: 'Hello, World!',
        })
        expect(response.headers.get('existing-header')).toBe('Hola')
        expect(response.headers.get('other-existing-header')).toBe('World')
      })
    })
  })

  describe('#setHeaders', () => {
    it('replaces headers', async () => {
      const handler = prismy([], () =>
        Result('Hello, World!', 200, {
          'existing-header': 'Hello',
        }).setHeaders({
          'new-header': 'Hola',
        }),
      )

      await testHandler(handler, async (url) => {
        const response = await testFetch(url)

        expect(response).toMatchObject({
          statusCode: 200,
          body: 'Hello, World!',
        })
        expect(response.headers.get('existing-header')).toBe(null)
        expect(response.headers.get('new-header')).toBe('Hola')
      })
    })
  })
})

describe('Redirect', () => {
  it('redirects', async () => {
    const handler = prismy([], () => Redirect('https://github.com/'))

    await testHandler(handler, async (url) => {
      const response = await testFetch(url, { redirect: 'manual' })
      expect(response).toMatchObject({
        statusCode: 302,
      })
      expect(response.headers.get('location')).toBe('https://github.com/')
    })
  })

  it('sets statusCode', async () => {
    const handler = prismy([], () => Redirect('https://github.com/', 301))

    await testHandler(handler, async (url) => {
      const response = await testFetch(url, { redirect: 'manual' })
      expect(response).toMatchObject({
        statusCode: 301,
      })
      expect(response.headers.get('location')).toBe('https://github.com/')
    })
  })

  it('sets headers', async () => {
    const handler = prismy([], () =>
      Redirect('https://github.com/', 302, {
        'custom-header': 'Hello!',
      }),
    )

    await testHandler(handler, async (url) => {
      const response = await testFetch(url, { redirect: 'manual' })
      expect(response).toMatchObject({
        statusCode: 302,
      })
      expect(response.headers.get('location')).toBe('https://github.com/')
      expect(response.headers.get('custom-header')).toBe('Hello!')
    })
  })
})
