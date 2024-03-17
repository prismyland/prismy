import { Handler, HeadersSelector, Result } from '../../src'
import { TestServer } from '../../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

describe('headersSelector', () => {
  it('select headers', async () => {
    const handler = Handler([HeadersSelector()], (headers) => {
      return Result(headers['x-test'])
    })

    const res = await ts.load(handler).call('/', {
      headers: {
        'x-test': 'Hello, World!',
      },
    })

    expect(await res.text()).toBe('Hello, World!')
  })
})
