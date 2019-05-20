import got from 'got'
import { createInjectDecorators, BaseHandler } from '..'
import { testServer } from './testServer'
import { ServerResponse, IncomingMessage } from 'http'

console.error = jest.fn()

describe('BaseHandler', () => {
  describe('#send', () => {
    it('sets statusCode via SendResult', async () => {
      const injectUrl = createInjectDecorators(req => req.url)
      class MyHandler extends BaseHandler {
        execute(@injectUrl url: string) {
          return this.send(201, url, [['x-test', 'Hello, World!']])
        }
      }

      await testServer(MyHandler, async url => {
        const response = await got(url)
        expect(response).toMatchObject({
          statusCode: 201,
          body: '/',
          headers: expect.objectContaining({
            'x-test': 'Hello, World!'
          })
        })
      })
    })
  })

  describe('#select', () => {
    it('selects via a selector', async () => {
      class MyHandler extends BaseHandler {
        getUrl() {
          return this.select(req => req.url)
        }

        execute() {
          const url = this.getUrl()

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
  })

  describe('#onError', () => {
    it('is used when an error is thrown', async () => {
      class MyHandler extends BaseHandler {
        execute() {
          throw new Error()
        }
      }

      await testServer(MyHandler, async url => {
        const response = await got(url, {
          json: true,
          throwHttpErrors: false
        })
        expect(response).toMatchObject({
          statusCode: 500,
          body: 'Internal Server Error'
        })
      })
    })

    it('can be overriden', async () => {
      class MyHandler extends BaseHandler {
        execute() {
          throw new Error('Hello, World!')
        }

        onError(req: IncomingMessage, res: ServerResponse, error: any) {
          return this.send(500, { message: error.message })
        }
      }

      await testServer(MyHandler, async url => {
        const response = await got(url, {
          json: true,
          throwHttpErrors: false
        })
        expect(response).toMatchObject({
          statusCode: 500,
          body: {
            message: 'Hello, World!'
          }
        })
      })
    })
  })
})
