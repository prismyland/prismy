import { PrismySelector } from './selectors/createSelector'
import { SelectorReturnTypeTuple } from './types'

/**
 * Compile a handler into a runnable function by resolving selectors
 * and injecting the arguments into the handler.
 *
 * @param selectors - Selectors to gather handler arguments from
 * @param handler - Handler to be compiled
 * @returns compiled handler ready to be used
 *
 * @internal
 */
export function compileHandler<S extends PrismySelector<unknown>[], R>(
  selectors: [...S],
  handler: (...args: SelectorReturnTypeTuple<S>) => R,
): () => Promise<R> {
  return async () => {
    return handler(...(await resolveSelectors(selectors)))
  }
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
async function resolveSelectors<S extends PrismySelector<unknown>[]>(
  selectors: [...S],
): Promise<SelectorReturnTypeTuple<S>> {
  const resolvedValues = []
  for (const selector of selectors) {
    const resolvedValue = await selector.resolve()
    resolvedValues.push(resolvedValue)
  }

  return resolvedValues as SelectorReturnTypeTuple<S>
}
