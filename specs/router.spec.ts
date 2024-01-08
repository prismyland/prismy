import {
  routeParamSelector,
  Result,
  Router,
  Route,
  Middleware,
  getPrismyContext,
} from '../src'
import { Handler } from '../src/handler'
import { testServerManager } from './helpers'

beforeAll(async () => {
  await testServerManager.start()
})

afterAll(async () => {
  await testServerManager.close()
})

describe('router', () => {
  it('routes with pathname', async () => {
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler([], () => {
      return Result('b')
    })
    const routerHandler = Router([Route('/a', handlerA), Route('/b', handlerB)])

    const response = await testServerManager.loadAndCall(routerHandler, '/b')

    expect(response).toMatchObject({
      statusCode: 200,
      body: 'b',
    })
  })

  it('routes with method', async () => {
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler([], () => {
      return Result('b')
    })

    const routerHandler = Router([
      Route(['/', 'get'], handlerA),
      Route(['/', 'post'], handlerB),
    ])
    testServerManager.load(routerHandler)

    const response1 = await testServerManager.call('/', { method: 'get' })

    expect(response1).toMatchObject({
      statusCode: 200,
      body: 'a',
    })

    const response2 = await testServerManager.call('/', { method: 'post' })

    expect(response2).toMatchObject({
      statusCode: 200,
      body: 'b',
    })
  })

  it('resolve params', async () => {
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler([routeParamSelector('id')], (id) => {
      return Result(id)
    })

    const routerHandler = Router([
      Route('/a', handlerA),
      Route('/b/:id', handlerB),
    ])

    const response = await testServerManager.loadAndCall(
      routerHandler,
      '/b/test-param',
    )

    expect(response).toMatchObject({
      statusCode: 200,
      body: 'test-param',
    })
  })

  it('resolves null if param is missing', async () => {
    expect.hasAssertions()
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler([routeParamSelector('not-id')], (notId) => {
      return Result(notId)
    })

    const routerHandler = Router([
      Route('/a', handlerA),
      Route('/b/:id', handlerB),
    ])

    const response = await testServerManager.loadAndCall(
      routerHandler,
      '/b/test-param',
    )

    expect(response).toMatchObject({
      statusCode: 200,
      body: '',
    })
  })

  it('throws 404 error when no route found', async () => {
    expect.hasAssertions()
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler([], () => {
      return Result('b')
    })

    const routerHandler = Router([
      Route(['/', 'get'], handlerA),
      Route(['/', 'post'], handlerB),
    ])

    const response = await testServerManager.loadAndCall(routerHandler, '/', {
      method: 'put',
    })

    expect(response).toMatchObject({
      statusCode: 404,
      body: expect.stringContaining('Error: Not Found'),
    })
  })

  it('uses custom not found handler if set', async () => {
    expect.hasAssertions()
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler([], () => {
      return Result('b')
    })
    const customNotFoundHandler = Handler([], () => {
      return Result('Error: Customized Not Found Response', 404)
    })

    const routerHandler = Router(
      [Route(['/', 'get'], handlerA), Route(['/', 'post'], handlerB)],
      {
        notFoundHandler: customNotFoundHandler,
      },
    )

    const response = await testServerManager.loadAndCall(routerHandler, '/', {
      method: 'put',
    })
    expect(response).toMatchObject({
      statusCode: 404,
      body: expect.stringContaining('Error: Customized Not Found Response'),
    })
  })

  it('prepends prefix to route path', async () => {
    expect.hasAssertions()
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler([], () => {
      return Result('b')
    })

    const routerHandler = Router(
      [Route(['/', 'get'], handlerA), Route(['/', 'post'], handlerB)],
      {
        prefix: '/admin',
      },
    )

    const response = await testServerManager.loadAndCall(
      routerHandler,
      '/admin',
    )

    expect(response).toMatchObject({
      statusCode: 200,
      body: expect.stringContaining('a'),
    })
  })

  it('prepends prefix to route path (without root `/`)', async () => {
    expect.hasAssertions()
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler([], () => {
      return Result('b')
    })

    const routerHandler = Router(
      [Route(['/', 'get'], handlerA), Route(['/', 'post'], handlerB)],
      {
        prefix: '/admin',
      },
    )

    const response = await testServerManager.loadAndCall(
      routerHandler,
      '/admin',
    )

    expect(response).toMatchObject({
      statusCode: 200,
      body: expect.stringContaining('a'),
    })
  })

  it('applies middleware', async () => {
    expect.hasAssertions()

    const weakMap = new WeakMap()
    const handlerA = Handler([], () => {
      const context = getPrismyContext()

      return Result(weakMap.get(context))
    })
    const handlerB = Handler([], () => {
      return Result('b')
    })

    const routerHandler = Router(
      [Route(['/', 'get'], handlerA), Route(['/', 'post'], handlerB)],
      {
        middleware: [
          Middleware([], (next) => () => {
            const context = getPrismyContext()
            weakMap.set(context, (weakMap.get(context) || '') + 'a')
            return next()
          }),
          Middleware([], (next) => () => {
            const context = getPrismyContext()
            weakMap.set(context, (weakMap.get(context) || '') + 'b')
            return next()
          }),
        ],
      },
    )

    const response = await testServerManager.loadAndCall(routerHandler)

    expect(response.statusCode).toBe(200)
  })
})
