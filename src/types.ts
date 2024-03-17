import { IncomingMessage } from 'http'
import { PrismyResult } from './result'
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

export type PrismyNextFunction = () => Promise<PrismyResult<unknown>>

/**
 * @public
 */
export interface BufferBodyOptions {
  limit?: string | number
  encoding?: string
}
