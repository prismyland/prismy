import {
  createErrorResObject,
  PrismyMiddleware,
  PrismyNextFunction,
  MaybePromise,
  SelectorReturnTypeTuple,
  PrismyResult,
} from '.'
import { PrismySelector } from './selectors/createSelector'
import { compileHandler } from './utils'

export class PrismyHandler<
  S extends PrismySelector<any>[] = PrismySelector<any>[],
> {
  constructor(
    public selectors: [...S],
    /**
     * PrismyHandler exposes `handler` for unit testing the handler.
     * @param args selected arguments
     */
    public handlerFunction: (
      ...args: SelectorReturnTypeTuple<S>
    ) => MaybePromise<PrismyResult>,
    public middlewareList: PrismyMiddleware<any[]>[],
  ) {}

  async handle(): Promise<PrismyResult> {
    const next: PrismyNextFunction = compileHandler(
      this.selectors,
      this.handlerFunction,
    )

    const pipe = this.middlewareList.reduce((next, middleware) => {
      return middleware.pipe(next)
    }, next)
    let result: PrismyResult
    try {
      result = await pipe()
    } catch (error) {
      /* istanbul ignore next */
      if (process.env.NODE_ENV !== 'test') {
        console.error(error)
      }
      result = createErrorResObject(error)
    }

    return result
  }
}

/**
 * Generates a handler to be used by http.Server
 *
 * @example
 * ```ts
 * const worldSelector: Selector<string> = () => "world"!
 *
 * const handler =  Handler([ worldSelector ], async world => {
 *  return Result(`Hello ${world}!`) // Hello world!
 * })
 * ```
 *
 * @remarks
 * Selectors must be a tuple (`[PrismySelector<string>, PrismySelector<number>]`) not an
 * array (`Selector<string>|Selector<number>[] `). Be careful when declaring the
 * array outside of the function call.
 *
 * @param selectors - Tuple of Selectors to generate arguments for handler
 * @param handlerFunction - Business logic handling the request
 * @param middlewareList - Middleware to pass request and response through
 *
 * @public *
 */
export function Handler<S extends PrismySelector<any>[]>(
  selectors: [...S],
  handlerFunction: (
    ...args: SelectorReturnTypeTuple<S>
  ) => MaybePromise<PrismyResult>,
  middlewareList: PrismyMiddleware<PrismySelector<any>[]>[] = [],
) {
  return new PrismyHandler(selectors, handlerFunction, middlewareList)
}
