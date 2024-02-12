import { BufferBodySelector, Handler, Result } from '../../src'
import { TestServer } from '../../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

describe('BufferBodySelector', () => {
  it('creates buffer body selector', async () => {
    const handler = Handler([BufferBodySelector()], (body) => {
      return Result(`${body.constructor.name}: ${body}`)
    })

    const res = await ts.load(handler).call('/', {
      method: 'post',
      body: Buffer.from('Hello!'),
    })

    expect(await res.text()).toBe('Buffer: Hello!')
  })
})
