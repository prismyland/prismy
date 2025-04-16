import { Handler, Result, TextBodySelector } from '../../src'
import { TestServer } from '../../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

describe('TextBodySelector', () => {
  it('creates buffer body selector', async () => {
    const handler = Handler([TextBodySelector()], (body) => {
      return Result(`${typeof body}: ${body}`)
    })

    const res = await ts.load(handler).call('/', {
      method: 'post',
      body: 'Hello, World!',
    })

    expect(await res.text()).toBe('string: Hello, World!')
  })
})
