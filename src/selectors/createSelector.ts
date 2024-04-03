import { SelectorReturnTypeTuple } from '..'
import { compileHandler } from '../utils'

export class PrismySelector<
  T,
  S extends PrismySelector<any>[] = PrismySelector<any, any>[],
> {
  constructor(
    public selectors: [...S],
    public select: (...args: SelectorReturnTypeTuple<S>) => Promise<T> | T,
  ) {}

  __internal__selector(): T | Promise<T> {
    const compiledSelector = compileHandler(this.selectors, this.select)
    return compiledSelector()
  }
}

export function createPrismySelector<
  T,
  S extends PrismySelector<any>[] = PrismySelector<any, any>[],
>(
  selectors: [...S],
  selectorFunction: (...args: SelectorReturnTypeTuple<S>) => T | Promise<T>,
): PrismySelector<T, S>
export function createPrismySelector<T>(
  selectorFunction: () => T | Promise<T>,
): PrismySelector<T, []>
export function createPrismySelector(
  selectorsOrFn: any,
  selectorFunction?: any,
) {
  if (selectorFunction == null) {
    return new PrismySelector([], selectorsOrFn)
  }
  return new PrismySelector(selectorsOrFn, selectorFunction)
}
