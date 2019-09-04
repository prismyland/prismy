import { IncomingMessage, ServerResponse, OutgoingHttpHeaders } from 'http'

/**
 * Request context used in selectors
 * 
 * @public
 */
export interface Context {
  req: IncomingMessage
}

/**
 * A Synchronous argument selector
 * 
 * @public
 */
export type SyncSelector<T> = (context: Context) => T
/**
 * An asynchronous argument selector
 * 
 * @public
 */
export type AsyncSelector<T> = (context: Context) => Promise<T>
/**
 * An argument selector to extract arguments for the handler
 * 
 * @public
 */
export type Selector<T> = SyncSelector<T> | AsyncSelector<T>

/**
 * @public
 */
export type Selectors<T> = { [P in keyof T]: Selector<T[P]> }

/**
 * @public
 */
export type Unpromise<T> = T extends Promise<infer U> ? U : T
export type Promisable<T> = T | Promise<T>

/**
 * prismy's representation of a response
 * 
 * @public
 */
export interface ResponseObject<B> {
  body?: B
  statusCode: number
  headers: OutgoingHttpHeaders
}

/**
 * prismy compaticble middleware
 * 
 * @public
 */
export interface PrismyPureMiddleware {
  (context: Context): (
    next: () => Promise<ResponseObject<any>>
  ) => Promise<ResponseObject<any>>
}
/**
 * prismy compaticble middleware
 * 
 * @public
 */
export interface PrismyMiddleware<A extends any[]>
  extends PrismyPureMiddleware {
  mhandler(
    next: () => Promise<ResponseObject<any>>
  ): (...args: A) => Promise<ResponseObject<any>>
}

export type ContextHandler = (context: Context) => Promise<ResponseObject<any>>

/**
 * @public
 */
export interface PrismyRequestListener<A extends any[]> {
  (req: IncomingMessage, res: ServerResponse): void
  handler(...args: A): Promisable<ResponseObject<any>>
  contextHandler: ContextHandler
}
