import { CookieSelector, Handler, Result } from '../../src'
import { TestServer } from '../../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

describe('CookieSelector', () => {
  it('selects a cookie value', async () => {
    const handler = Handler([CookieSelector('test')], (cookieValue) => {
      return Result({ cookieValue })
    })

    const res = await ts.load(handler).call('/', {
      headers: {
        cookie: 'test=Hello!',
      },
    })

    expect(await res.json()).toMatchObject({
      cookieValue: 'Hello!',
    })
    expect(res.status).toBe(200)
  })

  it('selects null if cookie is not set', async () => {
    const handler = Handler([CookieSelector('test')], (cookieValue) => {
      return Result({ cookieValue })
    })

    const res = await ts.load(handler).call('/')

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({
      cookieValue: null,
    })
  })
})
