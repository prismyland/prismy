import { rootHandler } from '..'

describe('index', () => {
  it('returns root page html', async () => {
    // When
    const result = await rootHandler.handler()

    // Then
    expect(result.body).toContain('Root Page')
  })
})
