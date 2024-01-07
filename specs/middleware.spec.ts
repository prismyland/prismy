import fetch from 'node-fetch'
import { testHandler } from './helpers'
import { prismy, res, Middleware, getPrismyContext } from '../src'
import { createPrismySelector } from '../src/selectors/createSelector'

describe('middleware', () => {
  it('creates Middleware via selectors and middleware handler', async () => {
    const rawUrlSelector = createPrismySelector(
      () => getPrismyContext().req.url!,
    )
    const errorMiddleware = Middleware(
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
      const response = await fetch(url)
      expect(response.status).toBe(500)
      expect(await response.text()).toBe('/ : Hey!')
    })
  })

  it('accepts async selectors', async () => {
    const asyncRawUrlSelector = createPrismySelector(
      async () => getPrismyContext().req.url!,
    )
    const errorMiddleware = Middleware(
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
      const response = await fetch(url)
      expect(response.status).toBe(500)
      expect(await response.text()).toBe('/ : Hey!')
    })
  })
})
