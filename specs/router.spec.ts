import got from 'got'
import { testHandler } from './helpers'
import { routeParamSelector, prismy, res, router, Route } from '../src'
import { join } from 'path'

describe('router', () => {
  it('routes with pathname', async () => {
    expect.hasAssertions()
    const handlerA = prismy([], () => {
      return res('a')
    })
    const handlerB = prismy([], () => {
      return res('b')
    })

    const routerHandler = router([Route('/a', handlerA), Route('/b', handlerB)])

    await testHandler(routerHandler, async (url) => {
      const response = await got(join(url, 'b'), {
        method: 'GET',
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'b',
      })
    })
  })

  it('routes with method', async () => {
    expect.assertions(2)
    const handlerA = prismy([], () => {
      return res('a')
    })
    const handlerB = prismy([], () => {
      return res('b')
    })

    const routerHandler = router([
      Route(['/', 'get'], handlerA),
      Route(['/', 'post'], handlerB),
    ])

    await testHandler(routerHandler, async (url) => {
      const response = await got(url, {
        method: 'GET',
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'a',
      })
    })

    await testHandler(routerHandler, async (url) => {
      const response = await got(url, {
        method: 'POST',
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'b',
      })
    })
  })

  it('resolve params', async () => {
    expect.hasAssertions()
    const handlerA = prismy([], () => {
      return res('a')
    })
    const handlerB = prismy([routeParamSelector('id')], (id) => {
      return res(id)
    })

    const routerHandler = router([
      Route('/a', handlerA),
      Route('/b/:id', handlerB),
    ])

    await testHandler(routerHandler, async (url) => {
      const response = await got(join(url, 'b/test-param'), {
        method: 'GET',
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'test-param',
      })
    })
  })

  it('resolves null if param is missing', async () => {
    expect.hasAssertions()
    const handlerA = prismy([], () => {
      return res('a')
    })
    const handlerB = prismy([routeParamSelector('not-id')], (notId) => {
      return res(notId)
    })

    const routerHandler = router([
      Route('/a', handlerA),
      Route('/b/:id', handlerB),
    ])

    await testHandler(routerHandler, async (url) => {
      const response = await got(join(url, 'b/test-param'), {
        method: 'GET',
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: '',
      })
    })
  })

  it('throws 404 error when no route found', async () => {
    expect.assertions(1)
    const handlerA = prismy([], () => {
      return res('a')
    })
    const handlerB = prismy([], () => {
      return res('b')
    })

    const routerHandler = router([
      Route(['/', 'get'], handlerA),
      Route(['/', 'post'], handlerB),
    ])

    await testHandler(routerHandler, async (url) => {
      const response = await got(url, {
        method: 'PUT',
        throwHttpErrors: false,
      })

      expect(response).toMatchObject({
        statusCode: 404,
        body: expect.stringContaining('Error: Not Found'),
      })
    })
  })
})
