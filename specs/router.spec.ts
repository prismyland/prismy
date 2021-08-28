import got from 'got'
import { testHandler } from './helpers'
import { prismy, res, router } from '../src'
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
      const response = await got(join(url, 'a'), {
        method: 'GET',
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'a',
      })
    })
  })
})
