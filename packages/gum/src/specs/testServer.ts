import http from 'http'
import micro from 'micro'
import listen from 'test-listen'
import { gum, HandlerClass } from '../'

export async function testServer(
  handlerClass: HandlerClass,
  testCallback: (url: string) => any
): Promise<void> {
  const server = new http.Server(micro(gum(handlerClass)))

  const url = await listen(server)
  try {
    await testCallback(url)
  } catch (error) {
    throw error
  } finally {
    server.close()
  }
}
