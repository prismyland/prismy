import http from 'http'
import micro from 'micro'
import listen from 'test-listen'
import { prismy, HandlerClass } from 'prismy'

export async function testServer(
  handlerClass: HandlerClass,
  testCallback: (url: string) => any
): Promise<void> {
  const server = new http.Server(micro(prismy(handlerClass)))

  const url = await listen(server)
  try {
    await testCallback(url)
  } catch (error) {
    throw error
  } finally {
    server.close()
  }
}
