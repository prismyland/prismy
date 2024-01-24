import { Result, Middleware, getPrismyContext, Handler } from '../src'
import { createPrismySelector } from '../src/selectors/createSelector'
import { TestServer } from '../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

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
          return Result(`${url} : ${(error as any).message}`, 500)
        }
      },
    )
    const handler = Handler(
      [],
      () => {
        throw new Error('Hey!')
      },
      [errorMiddleware],
    )

    const res = await ts.load(handler).call()

    expect(await res.text()).toBe('/ : Hey!')
    expect(res.status).toBe(500)
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
          return Result(`${url} : ${(error as any).message}`, 500)
        }
      },
    )
    const handler = Handler(
      [],
      () => {
        throw new Error('Hey!')
      },
      [errorMiddleware],
    )

    const res = await ts.load(handler).call()

    expect(await res.text()).toBe('/ : Hey!')
    expect(res.status).toBe(500)
  })
})
