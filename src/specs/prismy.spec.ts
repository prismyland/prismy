import got from 'got'
import { prismy, res, Selector, Middleware, testHandler } from '..'

describe('prismy', () => {
  it('returns node.js request handler', async () => {
    const handler = prismy([], () => res('Hello, World!'))

    await testHandler(handler, async url => {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Hello, World!'
      })
    })
  })

  it('selects value from context via selector', async () => {
    const rawUrlSelector: Selector<string> = context => context.req.url!
    const handler = prismy([rawUrlSelector], url => res(url))

    await testHandler(handler, async url => {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 200,
        body: '/'
      })
    })
  })

  it('expose raw prismy handler for unit tests', () => {
    const rawUrlSelector: Selector<string> = context => context.req.url!
    const handler = prismy([rawUrlSelector], url => res(url))

    const result = handler.handler('Hello, World!')

    expect(result).toEqual({
      body: 'Hello, World!',
      headers: {},
      statusCode: 200
    })
  })

  it('applys middleware', async () => {
    const errorMiddleware: Middleware = context => next => {
      try {
        return next()
      } catch (error) {
        return res(error.message, 500)
      }
    }
    const rawUrlSelector: Selector<string> = context => context.req.url!
    const handler = prismy(
      [rawUrlSelector],
      url => {
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
        body: 'Hey!'
      })
    })
  })

  it('applys middleware orderly', async () => {
    const problematicMiddleware: Middleware = context => next => {
      throw new Error('Hey!')
    }
    const errorMiddleware: Middleware = context => next => {
      try {
        return next()
      } catch (error) {
        return res(error.message, 500)
      }
    }
    const rawUrlSelector: Selector<string> = context => context.req.url!
    const handler = prismy(
      [rawUrlSelector],
      url => {
        return res(url)
      },
      [problematicMiddleware, errorMiddleware]
    )

    await testHandler(handler, async url => {
      const response = await got(url, {
        throwHttpErrors: false
      })
      expect(response).toMatchObject({
        statusCode: 500,
        body: 'Hey!'
      })
    })
  })

  it('handles unhandled errors', async () => {
    const rawUrlSelector: Selector<string> = context => context.req.url!
    const handler = prismy(
      [rawUrlSelector],
      url => {
        throw new Error('Hey!')
      },
      []
    )
    await testHandler(handler, async url => {
      const response = await got(url, {
        throwHttpErrors: false
      })
      expect(response).toMatchObject({
        statusCode: 500,
        body: 'Unhandled Error: Hey!'
      })
    })
  })
})
