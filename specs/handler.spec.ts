import { Handler, Result, createPrismySelector, getPrismyContext } from '../src'

describe('Handler', () => {
  it('exposes raw prismy handler for unit tests', () => {
    const rawUrlSelector = createPrismySelector(
      () => getPrismyContext().req.url!,
    )
    const handler = Handler([rawUrlSelector], (url) => Result(url))

    const result = handler.handle('Hello, World!')

    expect(result).toMatchObject({
      body: 'Hello, World!',
      headers: {},
      statusCode: 200,
    })
  })
})
