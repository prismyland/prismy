import { IncomingMessage, ServerResponse, OutgoingHttpHeaders } from 'http'

export interface Context {
  req: IncomingMessage
}

export type Selector<T> = (context: Context) => T | Promise<T>

export type Selectors<T> = { [P in keyof T]: Selector<T[P]> }

export interface ResponseObject<B> {
  body?: B
  statusCode: number
  headers: OutgoingHttpHeaders
}

export type Middleware = (
  context: Context
) => (next: () => Promise<ResponseObject<any>>) => Promise<ResponseObject<any>>

export interface PrismyRequestListener<A extends any[]> {
  (req: IncomingMessage, res: ServerResponse): void
  handler(...args: A): any
  selectors: Selectors<A>
}
