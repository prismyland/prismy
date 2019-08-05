import { IncomingMessage, ServerResponse } from 'http'
import { sendError, send, createError } from 'micro'
import { Context, HandlerClass } from './types'
import { getSelectors } from './createInjectDecorators'
import { BaseResult } from './results/BaseResult'
import { BaseHandler } from './BaseHandler'
export * from './selectors'
export * from './types'
export * from './createInjectDecorators'
export * from './results/SendResult'
export * from './BaseHandler'
export * from './results'
export { createError }

export interface PrismyOptions {
  onError?: HandlerClass
}

const errorHandlerSymbol = Symbol('prismy-error-handler')

export function prismy(
  handlerClasses: HandlerClass | HandlerClass[],
  options: PrismyOptions = {}
) {
  return async function requestHandler(
    req: IncomingMessage,
    res: ServerResponse
  ) {
    const context: Context = {
      req,
      res
    }
    context[errorHandlerSymbol] = options.onError
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

        const args = await getArgsOfHandlerClass(context, handlerClass)

        result = await handler.handle(...args)
        if (result !== undefined) {
          break
        }
      }
    } catch (error) {
      handleError(context, error)
      return
    }

    handleSendResult(context, result)
  }
}

async function getArgsOfHandlerClass(
  context: Context,
  handlerClass: any
): Promise<any[]> {
  const selectors = getSelectors(handlerClass)
  const args = await Promise.all(
    [...selectors].map(selector => selector(context))
  )
  return args
}

function handleSendResult(context: Context, result: unknown) {
  if (result === undefined) {
    sendError(
      context.req,
      context.res,
      new Error(
        'Returning undefined value from handlers are not allowed. Please use BaseResult.'
      )
    )
    return
  }
  if (result instanceof BaseResult) {
    result = result.handle(context)
  }
  if (result === undefined) {
    return
  }
  if (result === null) {
    send(context.res, 204, null)
    return
  }
  send(context.res, 200, result)
}

export async function handleError(context: Context, error: any) {
  const ErrorHandler = context[errorHandlerSymbol]
  if (ErrorHandler == null) {
    sendError(context.req, context.res, error)
    return
  }
  try {
    const errorHandler = new ErrorHandler()
    const args = await getArgsOfHandlerClass(context, ErrorHandler)
    const result = await errorHandler.handle(error, ...args)
    handleSendResult(context, result)
    return
  } catch (error) {
    console.warn(
      '!!!Using fallback error handler...!!! onError Handler must NOT throws an error.'
    )
    sendError(context.req, context.res, error)
    return
  }
}
