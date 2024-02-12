import { Handler, Result, BodySelector } from '../../src'
import { TestServer } from '../../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

describe('BodySelector', () => {
  it('selects text body', async () => {
    const handler = Handler([BodySelector()], (body) => {
      return Result(body)
    })

    const res = await ts.load(handler).call('/', {
      method: 'post',
      body: 'Hello!',
    })

    expect(await res.text()).toBe('Hello!')
  })

  it('selects parsed form', async () => {
    const handler = Handler([BodySelector()], (body) => {
      return Result(body)
    })

    const res = await ts.load(handler).call('/', {
      method: 'post',
      body: new URLSearchParams([['message', 'Hello!']]),
    })

    expect(await res.json()).toEqual({
      message: 'Hello!',
    })
  })

  it('selects json body', async () => {
    const handler = Handler([BodySelector()], (body) => {
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
})
