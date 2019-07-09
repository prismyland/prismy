import { Context, HandlerClass } from './types'
import { getSelectors } from './createInjectDecorators'
import { IncomingMessage, ServerResponse } from 'http'
import { BaseResult } from './results/BaseResult'
import { BaseHandler } from './BaseHandler'
export * from './types'
export * from './createInjectDecorators'
export * from './selectors'
export * from './results/SendResult'
export * from './BaseHandler'
export * from './results'
import micro from 'micro'

export interface PrismyOptions {
  onError?: HandlerClass
  production?: boolean
}

export function prismy(
  handlerClasses: HandlerClass | HandlerClass[],
  options: PrismyOptions = {}
) {
  async function requestHandler(req: IncomingMessage, res: ServerResponse) {
    const context: Context = {
      req,
      res
    }
    if (!Array.isArray(handlerClasses)) {
      handlerClasses = [handlerClasses]
    }

    let result: any
    try {
      for (const handlerClass of handlerClasses) {
        const handler = new handlerClass()
        if (handler instanceof BaseHandler) {
          handler.context = context
        }

        const args = await getArgs(handlerClass, context)

        result = await handler.handle(...args)
        if (result !== undefined) {
          break
        }
      }
    } catch (error) {
      if (options.onError == null) {
        throw error
      }
      const handler = new options.onError()
      const args = await getArgs(options.onError, context)
      result = await handler.handle(error, ...args)
    }

    return handleSendResult(context, result)
  }
  return micro(requestHandler)
}

async function getArgs(handlerClass: any, context: Context): Promise<any[]> {
  const selectors = getSelectors(handlerClass)
  const args = await Promise.all(
    [...selectors].map(selector => selector(context))
  )
  return args
}

function handleSendResult(context: Context, result: unknown) {
  if (result === undefined) {
    throw new Error(
      'Returning undefined value from handlers are not allowed. Please use BaseResult.'
    )
  }
  if (result instanceof BaseResult) {
    return result.handle(context)
  }
  return result
}
