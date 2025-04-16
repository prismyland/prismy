import {
  PrismyMiddleware,
  PrismyNextFunction,
  MaybePromise,
  SelectorReturnTypeTuple,
  PrismyResult,
  resolveSelectors,
} from '.'
import { PrismySelector } from './selector'

export class PrismyHandler<
  R extends PrismyResult<any> = PrismyResult<any>,
  S extends PrismySelector<any>[] = PrismySelector<any>[],
> {
  constructor(
    public selectors: [...S],
    /**
     * PrismyHandler exposes `handler` for unit testing the handler.
     * @param args selected arguments
     */
    public handle: (...args: SelectorReturnTypeTuple<S>) => MaybePromise<R>,
    public middlewareList: PrismyMiddleware<any[]>[],
  ) {}

  async __internal__handler(): Promise<PrismyResult<any>> {
    const next: PrismyNextFunction = async () => {
      return this.handle(...(await resolveSelectors(this.selectors)))
    }

    const pipe = this.middlewareList.reduce((next, middleware) => {
      return middleware.pipe(next)
    }, next)

    return await pipe()
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
export function Handler<
  R extends PrismyResult<any> = PrismyResult<any>,
  S extends PrismySelector<any>[] = [],
>(
  selectors: [...S],
  handlerFunction: (...args: SelectorReturnTypeTuple<S>) => MaybePromise<R>,
  middlewareList?: PrismyMiddleware<PrismySelector<any>[]>[],
): PrismyHandler<R, S>
export function Handler<R extends PrismyResult<any> = PrismyResult<any>>(
  handlerFunction: () => MaybePromise<R>,
  middlewareList?: PrismyMiddleware<PrismySelector<any>[]>[],
): PrismyHandler<R, []>
export function Handler<
  R extends PrismyResult<any> = PrismyResult<any>,
  S extends PrismySelector<any>[] = [],
>(
  selectorsOrHandler: any,
  handlerFunctionOrMiddlewareList?: any | any[],
  middlewareList?: any[],
) {
  if (Array.isArray(selectorsOrHandler)) {
    return new PrismyHandler(
      selectorsOrHandler,
      handlerFunctionOrMiddlewareList,
      middlewareList || [],
    )
  }
  return new PrismyHandler(
    [],
    selectorsOrHandler,
    handlerFunctionOrMiddlewareList || [],
  )
}
