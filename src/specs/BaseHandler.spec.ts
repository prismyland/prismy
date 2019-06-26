import got from 'got'
import { createInjectDecorators, BaseHandler } from '..'
import { testServer } from './testServer'

console.error = jest.fn()

describe('BaseHandler', () => {
  describe('#send', () => {
    it('sets statusCode via SendResult', async () => {
      const injectUrl = createInjectDecorators(({ req }) => req.url)
      class MyHandler extends BaseHandler {
        handle(@injectUrl url: string) {
          return this.send(url, {
            statusCode: 201,
            headers: [['x-test', 'Hello, World!']]
          })
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

  describe('#redirect', () => {
    it('sets statusCode via RedirectResult', async () => {
      class MyHandler extends BaseHandler {
        handle() {
          return this.redirect('http://example.com/', {
            statusCode: 301,
            headers: [['x-test', 'Hello, World!']]
          })
        }
      }

      await testServer(MyHandler, async url => {
        const response = await got(url, {
          followRedirect: false
        })
        expect(response).toMatchObject({
          statusCode: 301,
          headers: expect.objectContaining({
            'x-test': 'Hello, World!',
            location: 'http://example.com/'
          })
        })
      })
    })
  })

  describe('#select', () => {
    it('selects via a selector', async () => {
      class MyHandler extends BaseHandler {
        getUrl() {
          return this.select(({ req }) => req.url)
        }

        handle() {
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
})
