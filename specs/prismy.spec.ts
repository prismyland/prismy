import got from 'got'
import { testHandler } from './helpers'
import { prismy, res, Selector, PrismyPureMiddleware, err, getPrismyContext } from '../src'

describe('prismy', () => {
  it('returns node.js request handler', async () => {
    const handler = prismy([], () => res('Hello, World!'))

    await testHandler(handler, async url => {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Hello, World!'
      })
    })
  })

  it('selects value from context via selector', async () => {
    const rawUrlSelector: Selector<string> = () => {
      const { req } = getPrismyContext()
      return req.url!
    }
    const handler = prismy([rawUrlSelector], url => res(url))

    await testHandler(handler, async url => {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 200,
        body: '/'
      })
    })
  })

  it('selects value from context via selector', async () => {
    const asyncRawUrlSelector: Selector<string> = async () => getPrismyContext().req.url!
    const handler = prismy([asyncRawUrlSelector], url => res(url))

    await testHandler(handler, async url => {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 200,
        body: '/'
      })
    })
  })

  it('expose raw prismy handler for unit tests', () => {
    const rawUrlSelector: Selector<string> = () => getPrismyContext().req.url!
    const handler = prismy([rawUrlSelector], url => res(url))

    const result = handler.handler('Hello, World!')

    expect(result).toEqual({
      body: 'Hello, World!',
      headers: {},
      statusCode: 200
    })
  })

  it('applys middleware', async () => {
    const errorMiddleware: PrismyPureMiddleware = () => async next => {
      try {
        return await next()
      } catch (error) {
        return err(500, (error as any).message)
      }
    }
    const rawUrlSelector: Selector<string> = () => getPrismyContext().req.url!
    const handler = prismy(
      [rawUrlSelector],
      url => {
        throw new Error('Hey!')
      },
      [errorMiddleware]
    )

    await testHandler(handler, async url => {
      const response = await got(url, {
        throwHttpErrors: false
      })
      expect(response).toMatchObject({
        statusCode: 500,
        body: 'Hey!'
      })
    })
  })

  it('applys middleware orderly', async () => {
    const problematicMiddleware: PrismyPureMiddleware = () => async next => {
      throw new Error('Hey!')
    }
    const errorMiddleware: PrismyPureMiddleware = () => async next => {
      try {
        return await next()
      } catch (error) {
        return res((error as any).message, 500)
      }
    }
    const rawUrlSelector: Selector<string> = () => getPrismyContext().req.url!
    const handler = prismy(
      [rawUrlSelector],
      url => {
        return res(url)
      },
      [problematicMiddleware, errorMiddleware]
    )

    await testHandler(handler, async url => {
      const response = await got(url, {
        throwHttpErrors: false
      })
      expect(response).toMatchObject({
        statusCode: 500,
        body: 'Hey!'
      })
    })
  })

  it('handles unhandled errors from handlers', async () => {
    const handler = prismy(
      [],
      () => {
        throw new Error('Hey!')
      },
      []
    )
    await testHandler(handler, async url => {
      const response = await got(url, {
        throwHttpErrors: false
      })
      expect(response).toMatchObject({
        statusCode: 500,
        body: expect.stringContaining('Error: Hey!')
      })
    })
  })

  it('handles unhandled errors from selectors', async () => {
    const rawUrlSelector: Selector<string> = () => {
      throw new Error('Hey!')
    }
    const handler = prismy(
      [rawUrlSelector],
      url => {
        return res(url)
      },
      []
    )
    await testHandler(handler, async url => {
      const response = await got(url, {
        throwHttpErrors: false
      })
      expect(response).toMatchObject({
        statusCode: 500,
        body: expect.stringContaining('Error: Hey!')
      })
    })
  })
})
