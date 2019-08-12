import { res } from 'prismy'
import handler from '..'

describe('index', () => {
  it('returns parsed query', async () => {
    // When
    const result = await handler.handler({
      message: 'Hello, World!'
    })

    // Then
    expect(result).toEqual(
      res({
        message: 'Hello, World!'
      })
    )
  })
})
