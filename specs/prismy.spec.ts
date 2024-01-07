import fetch from 'node-fetch'
import { testHandler } from './helpers'
import { prismy, res, err, getPrismyContext, Middleware } from '../src'
import { createPrismySelector } from '../src/selectors/createSelector'
import { Handler } from '../src/handler'

describe('prismy', () => {
  it('returns node.js request handler', async () => {
    const handler = prismy([], () => res('Hello, World!'))

    await testHandler(handler, async (url) => {
      const response = await fetch(url)
      expect(response.status).toBe(200)
      expect(await response.text()).toBe('Hello, World!')
    })
  })

  it('selects value from context via selector', async () => {
    const rawUrlSelector = createPrismySelector(() => {
      const { req } = getPrismyContext()
      return req.url!
    })
    const handler = prismy([rawUrlSelector], (url) => res(url))

    await testHandler(handler, async (url) => {
      const response = await fetch(url)
      expect(response.status).toBe(200)
      expect(await response.text()).toBe('/')
    })
  })

  it('selects value from context via selector', async () => {
    const asyncRawUrlSelector = createPrismySelector(
      async () => getPrismyContext().req.url!,
    )
    const handler = prismy([asyncRawUrlSelector], (url) => res(url))

    await testHandler(handler, async (url) => {
      const response = await fetch(url)
      expect(response.status).toBe(200)
      expect(await response.text()).toBe('/')
    })
  })

  // TODO: move to handler.spec.ts
  it('exposes raw prismy handler for unit tests', () => {
    const rawUrlSelector = createPrismySelector(
      () => getPrismyContext().req.url!,
    )
    const handler = Handler([rawUrlSelector], (url) => res(url))

    const result = handler.handler('Hello, World!')

    expect(result).toEqual({
      body: 'Hello, World!',
      headers: {},
      statusCode: 200,
    })
  })

  it('applies middleware', async () => {
    const errorMiddleware = Middleware([], (next) => {
      return async () => {
        try {
          return await next()
        } catch (error) {
          return err(500, (error as any).message)
        }
      }
    })
    const rawUrlSelector = createPrismySelector(
      () => getPrismyContext().req.url!,
    )
    const handler = prismy(
      [rawUrlSelector],
      (url) => {
        throw new Error('Hey!')
      },
      [errorMiddleware],
    )

    await testHandler(handler, async (url) => {
      const response = await fetch(url)
      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Hey!')
    })
  })

  it('applies middleware orderly', async () => {
    const problematicMiddleware = Middleware([], (next) => () => {
      throw new Error('Hey!')
    })
    const errorMiddleware = Middleware([], (next) => async () => {
      try {
        return await next()
      } catch (error) {
        return res((error as any).message, 500)
      }
    })
    const rawUrlSelector = createPrismySelector(
      () => getPrismyContext().req.url!,
    )
    const handler = prismy(
      [rawUrlSelector],
      (url) => {
        return res(url)
      },
      [problematicMiddleware, errorMiddleware],
    )

    await testHandler(handler, async (url) => {
      const response = await fetch(url, {})
      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Hey!')
    })
  })

  it('handles unhandled errors from handlers', async () => {
    const handler = prismy(
      [],
      () => {
        throw new Error('Hey!')
      },
      [],
    )
    await testHandler(handler, async (url) => {
      const response = await fetch(url, {})

      expect(response.status).toBe(500)
      expect(await response.text()).toEqual(
        expect.stringContaining('Error: Hey!'),
      )
    })
  })

  it('handles unhandled errors from selectors', async () => {
    const rawUrlSelector = createPrismySelector(() => {
      throw new Error('Hey!')
    })
    const handler = prismy(
      [rawUrlSelector],
      (url) => {
        return res(url)
      },
      [],
    )
    await testHandler(handler, async (url) => {
      const response = await fetch(url, {})

      expect(response.status).toBe(500)
      expect(await response.text()).toEqual(
        expect.stringContaining('Error: Hey!'),
      )
    })
  })
})
