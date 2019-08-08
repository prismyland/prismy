import got from 'got'
import { prismy, res, Selector, Middleware, middleware, testHandler } from '..'
import { redirect } from '../utils'

describe('middleware', () => {
  it('creates Middleware via selectors and middleware handler', async () => {
    const rawUrlSelector: Selector<string> = context => context.req.url!
    const errorMiddleware: Middleware = middleware(
      [rawUrlSelector],
      next => url => {
        try {
          return next()
        } catch (error) {
          return res(`${url} : ${error.message}`, 500)
        }
      }
    )
    const handler = prismy(
      [],
      () => {
        throw new Error('Hey!')
      },
      [errorMiddleware]
    )

    await testHandler(handler, async url => {
      const response = await got(url, {
        throwHttpErrors: false
      })
      expect(response).toMatchObject({
        statusCode: 500,
        body: '/ : Hey!'
      })
    })
  })
})

describe('redirect', () => {
  it('redirects', async () => {
    const handler = prismy([], () => {
      return redirect('https://github.com')
    })

    await testHandler(handler, async url => {
      const response = await got(url, {
        followRedirect: false
      })
      expect(response).toMatchObject({
        statusCode: 302,
        headers: {
          location: 'https://github.com'
        }
      })
    })
  })

  it('redirects with specific statusCode', async () => {
    const handler = prismy([], () => {
      return redirect('https://github.com', 301)
    })

    await testHandler(handler, async url => {
      const response = await got(url, {
        followRedirect: false
      })
      expect(response).toMatchObject({
        statusCode: 301,
        headers: {
          location: 'https://github.com'
        }
      })
    })
  })

  it('redirects with specific headers', async () => {
    const handler = prismy([], () => {
      return redirect('https://github.com', undefined, {
        'x-test': 'Hello, World!'
      })
    })

    await testHandler(handler, async url => {
      const response = await got(url, {
        followRedirect: false
      })
      expect(response).toMatchObject({
        statusCode: 302,
        headers: {
          location: 'https://github.com',
          'x-test': 'Hello, World!'
        }
      })
    })
  })
})
