import http, { IncomingMessage, RequestListener, ServerResponse } from 'http'
import listen from 'async-listen'
import { prismy, PrismyHandler } from './'

export class PrismyTestServer {
  server: http.Server | null = null
  url: string = ''
  listener: RequestListener = () => {
    throw new Error('PrismyTestServer: Listener is not set')
  }
  status: 'idle' | 'starting' | 'closing' = 'idle'

  loadRequestListener(listener: RequestListener) {
    this.listener = listener
    return this
  }

  load(handler: PrismyHandler) {
    this.listener = prismy(handler)
    return this
  }

  private listen(req: IncomingMessage, res: ServerResponse) {
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

export function TestServer() {
  return new PrismyTestServer()
}
