import {
  SearchParamSelector,
  SearchParamListSelector,
  Result,
  Handler,
} from '../../src'
import { TestServer } from '../../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

describe('SearchParamSelector', () => {
  it('selects a search param', async () => {
    const handler = Handler([SearchParamSelector('message')], (message) => {
      return Result({ message })
    })

    const res = await ts.load(handler).call('/?message=Hello!')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      message: 'Hello!',
    })
  })

  it('selects null if there is no param with the name', async () => {
    const handler = Handler([SearchParamSelector('message')], (message) => {
      return Result({ message })
    })

    const res = await ts.load(handler).call('/')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      message: null,
    })
  })
})

describe('SearchParamListSelector', () => {
  it('selects a search param list', async () => {
    const handler = Handler(
      [SearchParamListSelector('message')],
      (messages) => {
        return Result({ messages })
      },
    )

    const res = await ts.load(handler).call('?message=Hello!&message=Hi!')

    expect(await res.json()).toEqual({
      messages: ['Hello!', 'Hi!'],
    })
  })

  it('selects an empty array if there is no param with the name', async () => {
    const handler = Handler(
      [SearchParamListSelector('message')],
      (messages) => {
        return Result({ messages })
      },
    )

    const res = await ts.load(handler).call('/')

    expect(await res.json()).toEqual({
      messages: [],
    })
  })
})
