import got from 'got'
import { testHandler } from './helpers'
import {
  prismy,
  res,
  PrismyPureMiddleware,
  middleware,
  getPrismyContext,
} from '../src'
import { createPrismySelector } from '../src/selectors/createSelector'

describe('middleware', () => {
  it('creates Middleware via selectors and middleware handler', async () => {
    const rawUrlSelector = createPrismySelector(
      () => getPrismyContext().req.url!,
    )
    const errorMiddleware: PrismyPureMiddleware = middleware(
      [rawUrlSelector],
      (next) => async (url) => {
        try {
          return await next()
        } catch (error) {
          return res(`${url} : ${(error as any).message}`, 500)
        }
      },
    )
    const handler = prismy(
      [],
      () => {
        throw new Error('Hey!')
      },
      [errorMiddleware],
    )

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        throwHttpErrors: false,
      })
      expect(response).toMatchObject({
        statusCode: 500,
        body: '/ : Hey!',
      })
    })
  })

  it('accepts async selectors', async () => {
    const asyncRawUrlSelector = createPrismySelector(
      async () => getPrismyContext().req.url!,
    )
    const errorMiddleware = middleware(
      [asyncRawUrlSelector],
      (next) => async (url) => {
        try {
          return await next()
        } catch (error) {
          return res(`${url} : ${(error as any).message}`, 500)
        }
      },
    )
    const handler = prismy(
      [],
      () => {
        throw new Error('Hey!')
      },
      [errorMiddleware],
    )

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        throwHttpErrors: false,
      })
      expect(response).toMatchObject({
        statusCode: 500,
        body: '/ : Hey!',
      })
    })
  })
})
