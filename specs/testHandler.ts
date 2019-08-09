import http from 'http'
import listen from 'test-listen'
import { RequestListener } from 'http'

export type TestCallback = (url: string) => void

export async function testHandler(
  handler: RequestListener,
  testCallback: TestCallback
): Promise<void> {
  const server = new http.Server(handler)

  const url = await listen(server)
  try {
    await testCallback(url)
  } catch (error) {
    /* istanbul ignore next */
    throw error
  } finally {
    server.close()
  }
}
