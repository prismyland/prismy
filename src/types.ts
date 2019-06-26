import { IncomingMessage, ServerResponse } from 'http'

export interface Context {
  req: IncomingMessage
  res: ServerResponse
}

export interface HandlerClass {
  new (): {
    handle: (...args: any[]) => any
  }
}

export type Selector<P> = (context: Context) => P
