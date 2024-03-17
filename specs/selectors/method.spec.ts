import { Handler, MethodSelector, Result } from '../../src'
import { TestServer } from '../../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

describe('MethodSelector', () => {
  it('selects method', async () => {
    const handler = Handler([MethodSelector()], (method) => {
      return Result(method)
    })

    const res = await ts.load(handler).call('/', {
      method: 'get',
    })

    expect(await res.text()).toBe('GET')

    const res2 = await ts.call('/', {
      method: 'put',
    })

    expect(await res2.text()).toBe('PUT')
  })
})
