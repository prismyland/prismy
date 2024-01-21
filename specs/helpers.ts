import http, { RequestListener } from 'http'
import listen from 'async-listen'
import { URL } from 'url'
import { PrismyHandler } from '../src'
import { PrismyTestServer } from '../src/test'

export type TestCallback = (url: string) => Promise<void> | void

/* istanbul ignore next */
export async function testHandler(
  handler: RequestListener,
  testCallback: TestCallback,
): Promise<void> {
  const server = new http.Server(handler)

  const url: URL = await listen(server)
  try {
    await testCallback(url.origin)
  } catch (error) {
    throw error
  } finally {
    server.close()
  }
}

/* istanbul ignore next */
export function expectType<T>(value: T): void {}

async function resolveTestResponse(response: Response) {
  const testResult = await response.text()

  return {
    statusCode: response.status,
    body: testResult,
    headers: response.headers,
  }
}

let testServer: null | PrismyTestServer = null
export const testServerManager = {
  start: () => {
    if (testServer == null) {
      testServer = new PrismyTestServer()
    }
    return testServer.start()
  },
  close: () => {
    if (testServer == null) {
      throw new Error('No test server to close')
    }
    return testServer.close()
  },
  load: (handler: PrismyHandler) => testServer!.load(handler),
  call: (url?: string, options?: RequestInit) =>
    testServer!.call(url, options).then(resolveTestResponse),
  loadRequestListener: (listener: RequestListener) =>
    testServer!.loadRequestListener(listener),
  loadAndCall: (
    handler: PrismyHandler,
    url?: string,
    options?: RequestInit,
  ) => {
    testServer!.load(handler)
    return testServer!.call(url, options).then(resolveTestResponse)
  },
  loadRequestListenerAndCall: (
    listener: RequestListener,
    url?: string,
    options?: RequestInit,
  ) => {
    testServer!.loadRequestListener(listener)
    return testServer!.call(url, options).then(resolveTestResponse)
  },
}
