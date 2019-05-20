import { getSelectors } from './createInjectDecorators'
import { IncomingMessage, ServerResponse } from 'http'
import { SendResult } from './SendResult'
import { send } from 'micro'
export * from './createInjectDecorators'
export * from './selectors'
export * from './SendResult'
export * from './BaseHandler'

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
      return handleSendResult(res, result)
    } catch (error) {
      if (handler.onError == null) {
        throw error
      }
      const errorResult = await handler.onError(req, res, error)
      return handleSendResult(res, errorResult)
    }
  }
}

function handleSendResult(res: ServerResponse, result: any) {
  if (result instanceof SendResult) {
    if (result.headers != null) {
      result.headers.forEach(([key, value]) => {
        res.setHeader(key, value)
      })
    }
    send(res, result.statusCode, result.data)
  } else {
    return result
  }
}
