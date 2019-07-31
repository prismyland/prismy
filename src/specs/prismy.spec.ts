import got from 'got'
import { prismy, createInjectDecorators, TextBody } from '..'
import { testServer } from './testServer'
import http from 'http'
import listen from 'test-listen'
import { Method } from '../selectors'
console.error = jest.fn()
console.warn = jest.fn()

describe('prismy', () => {
  it('returns node.js request handler', async () => {
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

  it('responses 204 if result is null', async () => {
    class MyHandler {
      handle() {
        return null
      }
    }

    await testServer(MyHandler, async url => {
      const response = await got(url)
      expect(response).toMatchObject({
        statusCode: 204,
        body: ''
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
      prismy(MyHandler, {
        onError: MyErrorHandler
      })
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
      prismy(MyHandler, {
        onError: MyErrorHandler
      })
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

  it('uses sendError of micro as a fallback for custom error handler', async () => {
    const spy = (console.warn = jest.fn())
    class MyHandler {
      handle() {
        throw new Error('Hello, World!')
      }
    }
    class MyErrorHandler {
      handle() {
        throw new Error('Hello, Another World!')
      }
    }

    const server = new http.Server(
      prismy(MyHandler, {
        onError: MyErrorHandler
      })
    )

    const url = await listen(server)
    try {
      const response = await got(url, {
        throwHttpErrors: false
      })
      expect(response).toMatchObject({
        statusCode: 500,
        body: 'Internal Server Error'
      })
      expect(spy).toBeCalled()
    } catch (error) {
      throw error
    } finally {
      server.close()
    }
  })
})
