import got from 'got'
import { createInjectDecorators, TextBody } from '..'
import { testServer } from './testServer'

console.error = jest.fn()

describe('prismy', () => {
  it('returns micro handler', async () => {
    class MyHandler {
      execute() {
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
    const StringUrl = createInjectDecorators(req => req.url)
    class MyHandler {
      execute(@StringUrl url: string) {
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
    const StringUrl = createInjectDecorators(req => req.url)
    class MyHandler {
      execute(@StringUrl url: string, @TextBody() textBody: string) {
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
      execute() {
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
      execute() {}
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
})
