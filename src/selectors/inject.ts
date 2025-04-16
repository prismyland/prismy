import { createPrismySelector, PrismySelector } from '../selector'

export function InjectSelector<V>(value: V): PrismySelector<V> {
  return createPrismySelector(() => value)
}
