import { Handler, JsonBodySelector, Result } from '../../src'
import { TestServer } from '../../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

describe('JsonBodySelector', () => {
  it('creates json body selector', async () => {
    const handler = Handler([JsonBodySelector()], (body) => {
      return Result(body)
    })

    const res = await ts.load(handler).call('/', {
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ message: 'Hello!' }),
    })

    expect(await res.json()).toEqual({
      message: 'Hello!',
    })
  })

  it('throw if content type of a request is not application/json', async () => {
    const handler = Handler([JsonBodySelector()], (body) => {
      return Result(body)
    })

    const res = await ts.load(handler).call('/', {
      method: 'post',
      body: JSON.stringify({ message: 'Hello!' }),
    })

    expect(await res.text()).toContain(
      'Error: Content type must be application/json. (Current: text/plain',
    )
  })
})
