import {
  prismy,
  getPrismyContext,
  Middleware,
  Result,
  ErrorResult,
} from '../src'
import { createPrismySelector } from '../src/selectors/createSelector'
import { Handler } from '../src/handler'
import { testServerManager } from './helpers'

beforeAll(async () => {
  await testServerManager.start()
})

afterAll(async () => {
  await testServerManager.close()
})

describe('prismy', () => {
  it('returns node.js request handler', async () => {
    const handler = prismy([], () => Result('Hello, World!'))

    const response = await testServerManager.loadRequestListenerAndCall(handler)

    expect(response).toMatchObject({
      statusCode: 200,
      body: 'Hello, World!',
    })
  })

  it('selects value from context via selector', async () => {
    const rawUrlSelector = createPrismySelector(() => {
      const { req } = getPrismyContext()
      return req.url!
    })
    const handler = prismy([rawUrlSelector], (url) => Result(url))

    const response = await testServerManager.loadRequestListenerAndCall(handler)

    expect(response).toMatchObject({
      statusCode: 200,
      body: '/',
    })
  })

  it('selects value from context via selector', async () => {
    const asyncRawUrlSelector = createPrismySelector(
      async () => getPrismyContext().req.url!,
    )
    const handler = prismy([asyncRawUrlSelector], (url) => Result(url))

    const response = await testServerManager.loadRequestListenerAndCall(handler)

    expect(response).toMatchObject({
      statusCode: 200,
      body: '/',
    })
  })

  // TODO: move to handler.spec.ts
  it('exposes raw prismy handler for unit tests', () => {
    const rawUrlSelector = createPrismySelector(
      () => getPrismyContext().req.url!,
    )
    const handler = Handler([rawUrlSelector], (url) => Result(url))

    const result = handler.handler('Hello, World!')

    expect(result).toMatchObject({
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
          return ErrorResult(500, (error as any).message)
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

    const response = await testServerManager.loadRequestListenerAndCall(handler)

    expect(response).toMatchObject({
      statusCode: 500,
      body: 'Hey!',
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
        return ErrorResult(500, (error as any).message)
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

    const response = await testServerManager.loadRequestListenerAndCall(handler)

    expect(response).toMatchObject({
      statusCode: 500,
      body: 'Hey!',
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

    const response = await testServerManager.loadRequestListenerAndCall(handler)

    expect(response).toMatchObject({
      statusCode: 500,
      body: expect.stringContaining('Error: Hey!'),
    })
  })

  it('handles unhandled errors from selectors', async () => {
    const rawUrlSelector = createPrismySelector(() => {
      throw new Error('Hey!')
    })
    const handler = prismy(
      [rawUrlSelector],
      (url) => {
        return Result(url)
      },
      [],
    )

    const response = await testServerManager.loadRequestListenerAndCall(handler)

    expect(response).toMatchObject({
      statusCode: 500,
      body: expect.stringContaining('Error: Hey!'),
    })
  })
})
