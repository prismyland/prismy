import { PrismyPureMiddleware } from './types'
import { middleware } from './middleware'
import { res } from './utils'

export { createError } from 'micro'

interface WithErrorHandlerOptions {
  dev?: boolean
  json?: boolean
}

export function createWithErrorHandler({
  dev = false,
  json = false
}: WithErrorHandlerOptions = {}): PrismyPureMiddleware {
  return middleware([], next => async () => {
    try {
      return await next()
    } catch (error) {
      const statusCode = error.statusCode || error.status || 500
      const message = dev
        ? error.stack
        : statusCode === 500
        ? 'Internal Server Error'
        : error.message

      return json ? res({ message }, statusCode) : res(message, statusCode)
    }
  })
}
