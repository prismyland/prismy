import got from 'got'
import { prismy, createInjectDecorators, TextBody } from '..'
import { testServer } from './testServer'
import http from 'http'
import micro from 'micro'
import listen from 'test-listen'
import { Method } from '../selectors'
console.error = jest.fn()

describe('prismy', () => {
  it('returns micro handler', async () => {
    class MyHandler {
      handle() {
        return 'Hello, World'
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Hello, World'
      })
    })
  })

  it('injects via a selector', async () => {
    const StringUrl = createInjectDecorators(({ req }) => req.url)
    class MyHandler {
      handle(@StringUrl url: string) {
        return url
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 200,
        body: '/'
      })
    })
  })

  it('injects via multiple selectors', async () => {
    const StringUrl = createInjectDecorators(({ req }) => req.url)
    class MyHandler {
      handle(@StringUrl url: string, @TextBody() textBody: string) {
        return {
          url,
          textBody
        }
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got.post(url, {
        body: 'Hello, World!'
      })
      expect(response).toMatchObject({
        statusCode: 200
      })
      expect(JSON.parse(response.body)).toEqual({
        url: '/',
        textBody: 'Hello, World!'
      })
    })
  })

  it('handles error throwing', async () => {
    class MyHandler {
      handle() {
        throw new Error()
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url, {
        throwHttpErrors: false
      })
      expect(response).toMatchObject({
        statusCode: 500,
        body: 'Internal Server Error'
      })
    })
  })

  it('throws when a handler is returning undefined', async () => {
    class MyHandler {
      handle() {}
    }

    await testServer(MyHandler, async url => {
      const response = await got(url, {
        throwHttpErrors: false
      })
      expect(response).toMatchObject({
        statusCode: 500,
        body: 'Internal Server Error'
      })
    })
  })

  it('handles errors with onError', async () => {
    class MyHandler {
      handle() {
        throw new Error('Hello, World!')
      }
    }
    class MyErrorHandler {
      handle(error: Error) {
        return error.message
      }
    }

    const server = new http.Server(
      micro(
        prismy(MyHandler, {
          onError: MyErrorHandler
        })
      )
    )

    const url = await listen(server)
    try {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Hello, World!'
      })
    } catch (error) {
      throw error
    } finally {
      server.close()
    }
  })

  it('handles errors with onError with injected args', async () => {
    const StringUrl = createInjectDecorators(({ req }) => req.url)
    class MyHandler {
      handle() {
        throw new Error('Hello, World!')
      }
    }
    class MyErrorHandler {
      handle(error: Error, @Method() method: string, @StringUrl url: string) {
        return `${method} ${url} - ${error.message}`
      }
    }

    const server = new http.Server(
      micro(
        prismy(MyHandler, {
          onError: MyErrorHandler
        })
      )
    )

    const url = await listen(server)
    try {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 200,
        body: 'GET / - Hello, World!'
      })
    } catch (error) {
      throw error
    } finally {
      server.close()
    }
  })
})
