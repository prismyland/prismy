import { testServerManager } from '../helpers'
import { CookieSelector, Handler, Result } from '../../src'

beforeAll(async () => {
  await testServerManager.start()
})

afterAll(async () => {
  await testServerManager.close()
})

describe('CookieSelector', () => {
  it('selects a cookie value', async () => {
    const handler = Handler([CookieSelector('test')], (cookieValue) => {
      return Result({ cookieValue })
    })

    const response = await testServerManager.loadAndCall(
      handler,
      '/test?query=true',
      {
        headers: {
          cookie: 'test=Hello!',
        },
      },
    )

    expect(response).toMatchObject({
      statusCode: 200,
    })
    expect(JSON.parse(response.body)).toMatchObject({
      cookieValue: 'Hello!',
    })
  })
})
