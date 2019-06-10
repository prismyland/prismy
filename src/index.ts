import { getSelectors } from './createInjectDecorators'
import { IncomingMessage, ServerResponse } from 'http'
import { BaseResult } from './results/BaseResult'
export * from './createInjectDecorators'
export * from './selectors'
export * from './results/SendResult'
export * from './BaseHandler'
export * from './results'

export interface HandlerClass {
  new (): {
    execute: (...args: any[]) => any
    context?: {
      req: IncomingMessage
      res: ServerResponse
      [key: string]: any
    }
    onError?: (req: IncomingMessage, res: ServerResponse, error: any) => any
  }
}

export function prismy(handlerClass: HandlerClass) {
  return async function requestHandler(
    req: IncomingMessage,
    res: ServerResponse
  ) {
    const handler = new handlerClass()
    handler.context = {
      req,
      res
    }
    try {
      const selectors = getSelectors(handlerClass)
      const args = await Promise.all(
        [...selectors].map(selector => selector(req, res))
      )

      const result = await handler.execute(...args)
      return handleSendResult(req, res, result)
    } catch (error) {
      if (handler.onError == null) {
        throw error
      }
      const errorResult = await handler.onError(req, res, error)
      return handleSendResult(req, res, errorResult)
    }
  }
}

function handleSendResult(
  req: IncomingMessage,
  res: ServerResponse,
  result: unknown
) {
  if (result === undefined) {
    throw new Error(
      'Returning undefined value from handlers are not allowed. Please use BaseResult.'
    )
  }
  if (result instanceof BaseResult) {
    return result.execute(req, res)
  }
  return result
}
