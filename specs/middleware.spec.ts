import { Result, Middleware, getPrismyContext, Handler } from '../src'
import { createPrismySelector } from '../src/selectors/createSelector'
import { testServerManager } from './helpers'

beforeAll(async () => {
  await testServerManager.start()
})

afterAll(async () => {
  await testServerManager.close()
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

    const response = await testServerManager.loadAndCall(handler)

    expect(response).toMatchObject({ statusCode: 500, body: '/ : Hey!' })
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

    const response = await testServerManager.loadAndCall(handler)

    expect(response).toMatchObject({ statusCode: 500, body: '/ : Hey!' })
  })
})
