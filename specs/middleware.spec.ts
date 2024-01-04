import got from 'got'
import { testHandler } from './helpers'
import { prismy, res, Selector, PrismyPureMiddleware, middleware, AsyncSelector, getPrismyContext } from '../src'

describe('middleware', () => {
  it('creates Middleware via selectors and middleware handler', async () => {
    const rawUrlSelector: Selector<string> = () => getPrismyContext().req.url!
    const errorMiddleware: PrismyPureMiddleware = middleware([rawUrlSelector], next => async url => {
      try {
        return await next()
      } catch (error) {
        return res(`${url} : ${(error as any).message}`, 500)
      }
    })
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

  it('accepts async selectors', async () => {
    const asyncRawUrlSelector: AsyncSelector<string> = async () => getPrismyContext().req.url!
    const errorMiddleware = middleware([asyncRawUrlSelector], next => async url => {
      try {
        return await next()
      } catch (error) {
        return res(`${url} : ${(error as any).message}`, 500)
      }
    })
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
