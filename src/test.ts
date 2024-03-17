import http, { IncomingMessage, RequestListener, ServerResponse } from 'http'
import listen from 'async-listen'
import { prismy, PrismyHandler } from './'

export class PrismyTestServer {
  server: http.Server | null = null
  url: string = ''
  /* istanbul ignore next */
  listener: RequestListener = () => {
    throw new Error('PrismyTestServer: Listener is not set.')
  }

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

  async call(url: string = '/', options?: RequestInit) {
    if (this.server == null) {
      throw new Error(
        'PrismyTestServer: Server is not ready. Please call `.start()` and wait till it finish.',
      )
    }
    return fetch(this.url + url, options)
  }

  async start() {
    if (this.server == null) {
      const server = new http.Server(this.listen.bind(this))
      const url = await listen(server)

      this.server = server
      this.url = url.origin
    }
  }

  async close() {
    /* istanbul ignore next */
    if (this.server == null) {
      return
    }

    const server = this.server
    this.server = null
    this.url = ''

    await new Promise((resolve, reject) => {
      server!.close((error) => {
        /* istanbul ignore next */
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
