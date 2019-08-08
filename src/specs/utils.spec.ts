import got from 'got'
import { prismy, res, Selector, Middleware, middleware, testHandler } from '..'

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
