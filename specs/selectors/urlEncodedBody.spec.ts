import { Handler, Result, UrlEncodedBodySelector } from '../../src'
import { TestServer } from '../../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

describe('UrlEncodedBody', () => {
  it('injects parsed url encoded body', async () => {
    const handler = Handler([UrlEncodedBodySelector()], (body) => {
      return Result(body)
    })
    const body = new URLSearchParams()
    body.append('message', 'Hello, World!')

    const res = await ts.load(handler).call('/', {
      method: 'post',
      body: body,
    })

    expect(await res.json()).toEqual({
      message: 'Hello, World!',
    })
  })
})
