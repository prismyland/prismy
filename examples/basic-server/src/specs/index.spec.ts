import { MyHandler } from '..'

describe('index', () => {
  it('returns parsed query', async () => {
    // Given
    const handler = new MyHandler()

    // When
    const result = await handler.handle({
      message: 'Hello, World!'
    })

    // Then
    expect(result).toEqual({
      message: 'Hello, World!'
    })
  })
})
