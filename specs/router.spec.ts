import got from 'got'
import { testHandler } from './helpers'
import { createRouteParamSelector, prismy, res, router } from '../src'
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

    const routerHandler = router([
      ['/a', handlerA],
      ['/b', handlerB],
    ])

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
      [['get', '/'], handlerA],
      [['post', '/'], handlerB],
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
    const handlerB = prismy([createRouteParamSelector('id')], (id) => {
      return res(id)
    })

    const routerHandler = router([
      ['/a', handlerA],
      ['/b/:id', handlerB],
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
    const handlerB = prismy([createRouteParamSelector('not-id')], (notId) => {
      return res(notId)
    })

    const routerHandler = router([
      ['/a', handlerA],
      ['/b/:id', handlerB],
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
      [['get', '/'], handlerA],
      [['post', '/'], handlerB],
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

  it('uses custom 404 error handler', async () => {
    expect.assertions(1)
    const handlerA = prismy([], () => {
      return res('a')
    })
    const handlerB = prismy([], () => {
      return res('b')
    })

    const routerHandler = router(
      [
        [['get', '/'], handlerA],
        [['post', '/'], handlerB],
      ],
      {
        notFoundHandler: prismy([], () => {
          return res('Not Found(Customized)', 404)
        }),
      }
    )

    await testHandler(routerHandler, async (url) => {
      const response = await got(url, {
        method: 'PUT',
        throwHttpErrors: false,
      })

      expect(response).toMatchObject({
        statusCode: 404,
        body: 'Not Found(Customized)',
      })
    })
  })
})
