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
import { TestServer } from '../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
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

    const res = await ts.load(routerHandler).call('/b')

    expect(await res.text()).toBe('b')
  })

  it('routes with pathname(shorthand)', async () => {
    const routerHandler = Router([
      Route('/a', [InjectSelector('a')], (data) => Result(data)),
      Route('/b', [InjectSelector('b')], (data) => Result(data)),
    ])

    const res = await ts.load(routerHandler).call('/b')

    expect(await res.text()).toBe('b')
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

    const res1 = await ts.load(routerHandler).call('/')

    expect(await res1.text()).toBe('a')

    const res2 = await ts.call('/', { method: 'post' })

    expect(await res2.text()).toBe('b')
  })

  it('throws 404 error when no route found', async () => {
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

    const res = await ts.load(routerHandler).call('/', {
      method: 'put',
    })

    expect(await res.text()).toContain('Error: Not Found')
    expect(res.status).toBe(404)
  })

  it('uses custom not found handler if set', async () => {
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

    const res = await ts.load(routerHandler).call('/', {
      method: 'put',
    })

    expect(res.status).toBe(404)
    expect(await res.text()).toContain('Error: Customized Not Found Response')
  })

  it('prepends prefix to route path', async () => {
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

    const res = await ts.load(routerHandler).call('/admin')

    expect(res.status).toBe(200)
    expect(await res.text()).toContain('a')
  })

  it('prepends prefix to route path (without root `/`)', async () => {
    const handlerA = Handler([], () => {
      return Result('a')
    })
    const handlerB = Handler([], () => {
      return Result('b')
    })

    const routerHandler = Router(
      [Route(['/', 'get'], handlerA), Route(['/', 'post'], handlerB)],
      {
        prefix: 'admin',
      },
    )

    const res = await ts.load(routerHandler).call('/admin')

    expect(res.status).toBe(200)
    expect(await res.text()).toContain('a')
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

    const res = await ts.load(routerHandler).call()

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('ba')
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

    const res = await ts.load(routerHandler).call('/b/test-param')

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('')
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

    const res = await ts.load(routerHandler).call('/b/test-param')

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('test-param')
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

    const res = await ts.load(routerHandler).call('/b/test1-test2-test3')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      attr1: 'test1',
      attr2: 'test2',
      attr3: 'test3',
    })

    const res2 = await ts.call('/b/test1-test2')
    expect(res2.status).toBe(200)
    expect(await res2.json()).toEqual({
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

    const res = await ts.load(routerHandler).call('/b/test1/test2/test3')

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({
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

    const res1 = await ts.load(routerHandler).call('/b/test1/test2')

    expect(res1.status).toBe(200)
    expect(await res1.json()).toEqual({
      param1: 'test1',
      param2: 'test2',
    })

    const res2 = await ts.load(routerHandler).call('/b/test1')

    expect(res2.status).toBe(200)
    expect(await res2.json()).toEqual({
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

    const res1 = await ts.load(routerHandler).call('/b/test1/test2')

    expect(res1.status).toBe(200)
    expect(await res1.json()).toEqual({
      param: 'test1',
    })

    const res2 = await ts.load(routerHandler).call('/b')

    expect(res2.status).toBe(200)
    expect(await res2.json()).toEqual({
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

    const res1 = await ts.load(routerHandler).call('/b/test1/test2')

    expect(res1.status).toBe(200)
    expect(await res1.json()).toEqual({
      param: 'test1',
    })

    const res2 = await ts.load(routerHandler).call('/b')

    expect(res2.status).toBe(404)
  })
})
