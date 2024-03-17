import { Handler, Result, UrlSelector } from '../../src'
import { TestServer } from '../../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

describe('UrlSelector', () => {
  it('selects url', async () => {
    const handler = Handler([UrlSelector()], (url) => {
      return Result({
        pathname: url.pathname,
        search: url.search,
      })
    })

    const res = await ts.load(handler).call('/test?query=true#hash')

    expect(await res.json()).toEqual({
      pathname: '/test',
      search: '?query=true',
    })
  })

  it('reuses parsed url', async () => {
    const handler = Handler([UrlSelector(), UrlSelector()], (url, url2) => {
      return Result(JSON.stringify(url === url2))
    })

    const res = await ts.load(handler).call('/test?query=true#hash')

    expect(await res.json()).toEqual(true)
  })
})
