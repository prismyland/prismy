import { IncomingMessage, ServerResponse, OutgoingHttpHeaders } from 'http'

/**
 * Request context used in selectors
 *
 * @public
 */
export interface PrismyContext {
  req: IncomingMessage
}

/**
 * A Synchronous argument selector
 *
 * @public
 */
export type SyncSelector<T> = () => T
/**
 * An asynchronous argument selector
 *
 * @public
 */
export type AsyncSelector<T> = () => Promise<T>
/**
 * An argument selector to extract arguments for the handler
 *
 * @public
 */
export type Selector<T> = SyncSelector<T> | AsyncSelector<T>

/**
 * Get the return type array of Selectors
 *
 * @public
 */
export type SelectorTuple<SS extends unknown[]> = [
  ...{
    [I in keyof SS]: Selector<SS[I]>
  }
]

/**
 * Get the return type of a Selector
 *
 * @public
 */
export type SelectorReturnType<S> = S extends Selector<infer T> ? T : never

/**
 * Get the return type array of Selectors
 *
 * @public
 */
export type SelectorReturnTypeTuple<SS extends Selector<unknown>[]> = [
  ...{
    [I in keyof SS]: SelectorReturnType<SS[I]>
  }
]

/**
 * @public
 */
export type PromiseResolve<T> = T extends Promise<infer U> ? U : T

/**
 * @public
 */
export type Promisable<T> = T | Promise<T>

/**
 * prismy's representation of a response
 *
 * @public
 */
export interface ResponseObject<B = unknown> {
  body?: B
  statusCode?: number
  headers?: OutgoingHttpHeaders
}

/**
 * shorter type alias for ResponseObject<B>
 *
 * @public
 */
export type Res<B> = ResponseObject<B>

/**
 * alias for Promise<ResponseObject<B>> for user with async handlers
 *
 * @public
 */
export type AsyncRes<B> = Promise<ResponseObject<B>>

/**
 * prismy compaticble middleware
 *
 * @public
 */
export interface PrismyPureMiddleware {
  (): (next: () => Promise<ResponseObject<any>>) => Promise<ResponseObject<any>>
}
/**
 * prismy compatible middleware
 *
 * @public
 */
export interface PrismyMiddleware<A extends any[]> extends PrismyPureMiddleware {
  mhandler(next: () => Promise<ResponseObject<any>>): (...args: A) => Promise<ResponseObject<any>>
}

/**
 * @public
 */
export interface PrismyHandler<A extends any[]> {
  (req: IncomingMessage, res: ServerResponse): void
  /**
   * PrismyHandler exposes `handler` for unit testing the handler.
   * @param args selected arguments
   */
  handler(...args: A): Promisable<ResponseObject<any>>
  /**
   * PrismyHandler exposes compiled funciton which must be ran in a prismy context.
   * This is useful when using a prismy handler in other prismy handler or a middleware like Routing.
   * `router()` is also using this prop to run a handler after matching URL.
   */
  contextHandler: () => Promise<ResponseObject<any>>
}

/**
 * @public
 */
export interface BufferBodyOptions {
  limit?: string | number
  encoding?: string
}
