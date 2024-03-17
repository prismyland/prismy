export class PrismySelector<T> {
  selectorFunction: () => Promise<T> | T
  constructor(selectorFunction: () => Promise<T> | T) {
    this.selectorFunction = selectorFunction
  }
  resolve(): T | Promise<T> {
    return this.selectorFunction()
  }
}

export function createPrismySelector<T>(
  selectorFunction: () => T | Promise<T>,
) {
  return new PrismySelector(selectorFunction)
}
