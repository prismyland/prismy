import http, { IncomingMessage, RequestListener, ServerResponse } from 'http'
import listen from 'async-listen'
import { URL } from 'url'
import { prismy, PrismyHandler } from '../src'

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
export class PrismyTestServer {
  server: http.Server | null = null
  url: string = ''
  listener: RequestListener = () => {
    throw new Error('PrismyTestServer: Listener is not set')
  }
  status: 'idle' | 'starting' | 'closing' = 'idle'

  loadRequestListener(listener: RequestListener) {
    this.listener = listener
  }
  load(handler: PrismyHandler) {
    this.listener = prismy(handler)
  }

  listen(req: IncomingMessage, res: ServerResponse) {
    this.listener(req, res)
  }

  call(url: string = '/', options?: RequestInit) {
    return fetch(this.url + url, options)
  }

  async start() {
    if (this.status !== 'idle') {
      throw new Error(
        `Cannot start test server (Current status: ${this.status})`,
      )
    }

    if (this.server == null) {
      const server = new http.Server(this.listen.bind(this))
      const url = await listen(server)

      this.server = server
      this.url = url.origin
    }
  }

  async close() {
    if (this.status !== 'idle') {
      throw new Error(
        `Cannot close test server (Current status: ${this.status})`,
      )
    }

    if (this.server == null) {
      return
    }

    const server = this.server
    this.server = null
    this.url = ''

    await new Promise((resolve, reject) => {
      server!.close((error) => {
        if (error != null) {
          reject(error)
        } else {
          resolve(null)
        }
      })
    })
  }
}
