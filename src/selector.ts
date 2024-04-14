import { SelectorReturnTypeTuple } from '.'

export class PrismySelector<
  T,
  S extends PrismySelector<any>[] = PrismySelector<any, any>[],
> {
  constructor(
    public selectors: [...S],
    public select: (...args: SelectorReturnTypeTuple<S>) => Promise<T> | T,
  ) {}

  async __internal__selector(): Promise<T> {
    return this.select(...(await resolveSelectors(this.selectors)))
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

/**
 * Executes the selectors and produces an array of args to be passed to
 * a handler
 *
 * @param context - Context object to be passed to the selectors
 * @param selectors - array of selectos
 * @returns arguments for a handler
 *
 * @internal
 */
export async function resolveSelectors<S extends PrismySelector<unknown>[]>(
  selectors: [...S],
): Promise<SelectorReturnTypeTuple<S>> {
  const resolvedValues = []
  for (const selector of selectors) {
    const resolvedValue = await selector.__internal__selector()
    resolvedValues.push(resolvedValue)
  }

  return resolvedValues as SelectorReturnTypeTuple<S>
}
