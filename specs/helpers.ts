import http from 'http'
import listen from 'test-listen'
import { RequestListener } from 'http'

export type TestCallback = (url: string) => Promise<void> | void

/* istanbul ignore next */
export async function testHandler(
  handler: RequestListener,
  testCallback: TestCallback,
): Promise<void> {
  const server = new http.Server(handler)

  const url = await listen(server)
  try {
    await testCallback(url)
  } catch (error) {
    throw error
  } finally {
    server.close()
  }
}

/* istanbul ignore next */
export function expectType<T>(value: T): void {}
