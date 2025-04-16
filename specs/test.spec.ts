import { TestServer } from '../src/test'

describe('PrismyTestServer', () => {
  it('throws when calling server without starting', async () => {
    const error = await TestServer()
      .call()
      .catch((error) => error)
    expect(error.toString()).toMatch('PrismyTestServer: Server is not ready.')
  })

  it('default listener throws', () => {
    expect(TestServer().listener).toThrow(
      'PrismyTestServer: Listener is not set.',
    )
  })
})
