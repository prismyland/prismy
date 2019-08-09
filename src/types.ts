import { IncomingMessage, ServerResponse, OutgoingHttpHeaders } from 'http'

export interface Context {
  req: IncomingMessage
}

export type SyncSelector<T> = (context: Context) => T
export type AsyncSelector<T> = (context: Context) => Promise<T>
export type Selector<T> = SyncSelector<T> | AsyncSelector<T>

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
