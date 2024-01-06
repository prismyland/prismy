import {
  createErrorResObject,
  PrismyMiddleware,
  PrismyNextFunction,
  Promisable,
  ResponseObject,
  SelectorReturnTypeTuple,
} from '.'
import { PrismySelector } from './selectors/createSelector'
import { compileHandler } from './utils'

export class PrismyHandler<S extends PrismySelector<any>[]> {
  constructor(
    public selectors: [...S],
    /**
     * PrismyHandler exposes `handler` for unit testing the handler.
     * @param args selected arguments
     */
    public handler: (
      ...args: SelectorReturnTypeTuple<S>
    ) => Promisable<ResponseObject<any>>,
    public middlewareList: PrismyMiddleware<any[]>[],
  ) {}

  async handle(): Promise<ResponseObject<any>> {
    const next: PrismyNextFunction = compileHandler(
      this.selectors,
      this.handler,
    )

    const pipe = this.middlewareList.reduce((next, middleware) => {
      return middleware(next)
    }, next)

    let resObject
    try {
      resObject = await pipe()
    } catch (error) {
      /* istanbul ignore next */
      if (process.env.NODE_ENV !== 'test') {
        console.error(error)
      }
      resObject = createErrorResObject(error)
    }

    return resObject
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
 *  return res(`Hello ${world}!`) // Hello world!
 * })
 * ```
 *
 * @remarks
 * Selectors must be a tuple (`[PrismySelector<string>, PrismySelector<number>]`) not an
 * array (`Selector<string>|Selector<number>[] `). Be careful when declaring the
 * array outside of the function call.
 *
 * @param selectors - Tuple of Selectors to generate arguments for handler
 * @param handler - Business logic handling the request
 * @param middlewareList - Middleware to pass request and response through
 *
 * @public *
 */
export function Handler<S extends PrismySelector<any>[]>(
  selectors: [...S],
  handler: (
    ...args: SelectorReturnTypeTuple<S>
  ) => Promisable<ResponseObject<any>>,
  middlewareList: PrismyMiddleware<any[]>[] = [],
) {
  return new PrismyHandler(selectors, handler, middlewareList)
}
