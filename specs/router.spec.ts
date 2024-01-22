import {
  RouteParamSelector,
  Result,
  Router,
  Route,
  Middleware,
  getPrismyContext,
} from '../src'
import { Handler } from '../src/handler'
import { InjectSelector } from '../src/selectors/inject'
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

  it('routes with pathname(shorthand)', async () => {
    const routerHandler = Router([
      Route('/a', [InjectSelector('a')], (data) => Result(data)),
      Route('/b', [InjectSelector('b')], (data) => Result(data)),
    ])

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

    const routerHandler = Router([Route(['/', 'get'], handlerA)], {
      middleware: [
        Middleware([InjectSelector('a')], (next) => (value) => {
          const context = getPrismyContext()
          weakMap.set(context, (weakMap.get(context) || '') + value)
          return next()
        }),
        Middleware([InjectSelector('b')], (next) => (value) => {
          const context = getPrismyContext()
          weakMap.set(context, (weakMap.get(context) || '') + value)
          return next()
        }),
      ],
    })

    const response = await testServerManager.loadAndCall(routerHandler)

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe('ba')
  })
})

describe('RouteParamSelector', () => {
  it('resolves null if the param is missing', async () => {
    expect.hasAssertions()
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler([RouteParamSelector('not-id')], (notId) => {
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

  it('resolves a param (named parameter)', async () => {
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler([RouteParamSelector('id')], (id) => {
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

  it('resolves params (custom suffix)', async () => {
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler(
      [
        RouteParamSelector('attr1'),
        RouteParamSelector('attr2'),
        RouteParamSelector('attr3'),
      ],
      (attr1, attr2, attr3) => {
        return Result({
          attr1,
          attr2,
          attr3,
        })
      },
    )

    const routerHandler = Router([
      Route('/a', handlerA),
      Route('/b/:attr1?{-:attr2}?{-:attr3}?', handlerB),
    ])

    const response1 = await testServerManager.loadAndCall(
      routerHandler,
      '/b/test1-test2-test3',
    )

    expect(response1).toMatchObject({
      statusCode: 200,
    })
    expect(JSON.parse(response1.body)).toMatchObject({
      attr1: 'test1',
      attr2: 'test2',
      attr3: 'test3',
    })

    const response2 = await testServerManager.loadAndCall(
      routerHandler,
      '/b/test1-test2',
    )
    expect(response2).toMatchObject({
      statusCode: 200,
    })
    expect(JSON.parse(response2.body)).toMatchObject({
      attr1: 'test1',
      attr2: 'test2',
      attr3: null,
    })
  })

  it('resolves a param (unnamed parameter)', async () => {
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler(
      [RouteParamSelector('id'), RouteParamSelector('0')],
      (id, unnamedParam) => {
        return Result({
          id,
          unnamedParam,
        })
      },
    )

    const routerHandler = Router([
      Route('/a', handlerA),
      Route('/b/:id/(.*)', handlerB),
    ])

    const response = await testServerManager.loadAndCall(
      routerHandler,
      '/b/test1/test2/test3',
    )

    expect(response).toMatchObject({
      statusCode: 200,
    })
    expect(JSON.parse(response.body)).toMatchObject({
      id: 'test1',
      unnamedParam: 'test2/test3',
    })
  })

  it('resolves a param (optional)', async () => {
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler(
      [RouteParamSelector('param1'), RouteParamSelector('param2')],
      (param1, param2) => {
        return Result({
          param1,
          param2,
        })
      },
    )

    const routerHandler = Router([
      Route('/a', handlerA),
      Route('/b/:param1/:param2?', handlerB),
    ])

    const response1 = await testServerManager.loadAndCall(
      routerHandler,
      '/b/test1/test2',
    )

    expect(response1).toMatchObject({
      statusCode: 200,
    })
    expect(JSON.parse(response1.body)).toMatchObject({
      param1: 'test1',
      param2: 'test2',
    })

    const response2 = await testServerManager.call('/b/test1')

    expect(response2).toMatchObject({
      statusCode: 200,
    })
    expect(JSON.parse(response2.body)).toMatchObject({
      param1: 'test1',
      param2: null,
    })
  })

  it('resolves the first param only (zero or more)', async () => {
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler([RouteParamSelector('param')], (param) => {
      return Result({
        param,
      })
    })

    const routerHandler = Router([
      Route('/a', handlerA),
      Route('/b/:param*', handlerB),
    ])

    const response1 = await testServerManager.loadAndCall(
      routerHandler,
      '/b/test1/test2',
    )

    expect(response1).toMatchObject({
      statusCode: 200,
    })
    expect(JSON.parse(response1.body)).toMatchObject({
      param: 'test1',
    })

    const response2 = await testServerManager.loadAndCall(routerHandler, '/b')

    expect(response2).toMatchObject({
      statusCode: 200,
    })
    expect(JSON.parse(response2.body)).toMatchObject({
      param: null,
    })
  })

  it('resolves the first param only (one or more)', async () => {
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler([RouteParamSelector('param')], (param) => {
      return Result({
        param,
      })
    })

    const routerHandler = Router([
      Route('/a', handlerA),
      Route('/b/:param+', handlerB),
    ])

    const response1 = await testServerManager.loadAndCall(
      routerHandler,
      '/b/test1/test2',
    )

    expect(response1).toMatchObject({
      statusCode: 200,
    })
    expect(JSON.parse(response1.body)).toMatchObject({
      param: 'test1',
    })

    const response2 = await testServerManager.loadAndCall(routerHandler, '/b')

    expect(response2).toMatchObject({
      statusCode: 404,
    })
  })
})
