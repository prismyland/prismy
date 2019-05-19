import { IncomingMessage, ServerResponse } from 'http'

export type Selector<P> = (
  req: IncomingMessage,
  res: ServerResponse
) => P | Promise<P>

const selectorMap = new Map<any, Selector<any>[]>()

export function setSelector(target: any, selector: Selector<any>) {
  let selectors = selectorMap.get(target.constructor)
  if (selectors == null) {
    selectors = []
    selectorMap.set(target.constructor, selectors)
  }

  selectors.unshift(selector)
}

export function getSelectors(target: any): Selector<any>[] {
  return selectorMap.get(target) || []
}

export function createSelectDecorators<P>(selector: Selector<P>) {
  return function selectDecorator(
    target: any,
    propertyName: string,
    paramIndex: number
  ) {
    if (propertyName !== 'execute') {
      throw new Error(
        'selector decorator must be applied `execute` method of a handler class.'
      )
    }

    setSelector(target, selector)
  }
}
