import { IncomingMessage, OutgoingHttpHeaders } from 'http'
import { PrismySelector } from './selectors/createSelector'

/**
 * Request context used in selectors
 *
 * @public
 */
export interface PrismyContext {
  req: IncomingMessage
}

/**
 * Get the return type array of Selectors
 *
 * @public
 */
export type SelectorTuple<SS extends unknown[]> = [
  ...{
    [I in keyof SS]: PrismySelector<SS[I]>
  },
]

/**
 * Get the return type of a Selector
 *
 * @public
 */
export type SelectorReturnType<S> = S extends PrismySelector<infer T>
  ? T
  : never

/**
 * Get the return type array of Selectors
 *
 * @public
 */
export type SelectorReturnTypeTuple<SS extends PrismySelector<unknown>[]> = [
  ...{
    [I in keyof SS]: SelectorReturnType<SS[I]>
  },
]

/**
 * @public
 */
export type PromiseResolve<T> = T extends Promise<infer U> ? U : T

/**
 * @public
 */
export type MaybePromise<T> = T | Promise<T>

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

export type PrismyNextFunction = () => Promise<ResponseObject<any>>

/**
 * @public
 */
export interface BufferBodyOptions {
  limit?: string | number
  encoding?: string
}
