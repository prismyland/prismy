import { createPrismySelector, PrismySelector } from './createSelector'

export function InjectSelector<V>(value: V): PrismySelector<V> {
  return createPrismySelector(() => value)
}
