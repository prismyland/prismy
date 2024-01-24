import {
  prismy,
  getPrismyContext,
  Middleware,
  Result,
  ErrorResult,
} from '../src'
import { createPrismySelector } from '../src/selectors/createSelector'
import { TestServer } from '../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

describe('prismy', () => {
  it('returns node.js request handler', async () => {
    const listener = prismy([], () => Result('Hello, World!'))

    const res = await ts.loadRequestListener(listener).call()

    expect(await res.text()).toBe('Hello, World!')
    expect(res.status).toBe(200)
  })

  it('selects value from context via selector', async () => {
    const rawUrlSelector = createPrismySelector(() => {
      const { req } = getPrismyContext()
      return req.url!
    })
    const listener = prismy([rawUrlSelector], (url) => Result(url))

    const res = await ts.loadRequestListener(listener).call()

    expect(await res.text()).toBe('/')
    expect(res.status).toBe(200)
  })

  it('applies middleware', async () => {
    const errorMiddleware = Middleware([], (next) => {
      return async () => {
        try {
          return await next()
        } catch (error) {
          return ErrorResult(500, (error as any).message)
        }
      }
    })
    const rawUrlSelector = createPrismySelector(
      () => getPrismyContext().req.url!,
    )
    const listener = prismy(
      [rawUrlSelector],
      (url) => {
        throw new Error('Hey!')
      },
      [errorMiddleware],
    )

    const res = await ts.loadRequestListener(listener).call()

    expect(await res.text()).toBe('Hey!')
    expect(res.status).toBe(500)
  })

  it('applies middleware in order (later = deeper)', async () => {
    const problematicMiddleware = Middleware([], (next) => () => {
      throw new Error('Hey!')
    })
    const errorMiddleware = Middleware([], (next) => async () => {
      try {
        return await next()
      } catch (error) {
        return ErrorResult(500, 'Something is wrong!')
      }
    })
    const rawUrlSelector = createPrismySelector(
      () => getPrismyContext().req.url!,
    )
    const handler = prismy(
      [rawUrlSelector],
      (url) => {
        return Result(url)
      },
      [problematicMiddleware, errorMiddleware],
    )

    const res = await ts.loadRequestListener(handler).call()

    expect(await res.text()).toBe('Something is wrong!')
    expect(res.status).toBe(500)
  })

  it('handles errors from handlers by default', async () => {
    const listener = prismy(
      [],
      () => {
        throw new Error('Hey!')
      },
      [],
    )

    const res = await ts.loadRequestListener(listener).call()

    expect(await res.text()).toContain('Error: Hey!')
    expect(res.status).toBe(500)
  })

  it('handles errors from selectors by default', async () => {
    const rawUrlSelector = createPrismySelector(() => {
      throw new Error('Hey!')
    })
    const listener = prismy(
      [rawUrlSelector],
      (url) => {
        return Result(url)
      },
      [],
    )

    const res = await ts.loadRequestListener(listener).call()

    expect(await res.text()).toContain('Error: Hey!')
    expect(res.status).toBe(500)
  })

  it('handles errors from middleware by default', async () => {
    const middleware = Middleware([], (next) => () => {
      throw new Error('Hey!')
    })
    const listener = prismy(
      [],
      () => {
        return Result('Hello!')
      },
      [middleware],
    )

    const res = await ts.loadRequestListener(listener).call()

    expect(await res.text()).toContain('Error: Hey!')
    expect(res.status).toBe(500)
  })
})

describe('getPrismyContext', () => {
  it('throws if context is not set(resolved outside of prismy)', () => {
    expect(() => {
      const context = getPrismyContext()
      throw new Error(`should fail to get context. ${context}`)
    }).toThrow('Prismy context is not loaded.')
  })
})
