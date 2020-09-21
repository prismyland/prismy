import { PrismyPureMiddleware } from './types'
import { middleware } from './middleware'
import { res } from './utils'

export { createError } from 'micro'

interface WithErrorHandlerOptions {
  dev?: boolean
  json?: boolean
  silent?: boolean
}

/**
 * Factory function to create a simple error handler middleware
 *
 * @remarks
 * Catches errors thrown and returns either text or json response
 * depending on configuration.
 * Will display either the string error message or the full stack if
 * `dev = true`
 *
 * @param options - Options including whether to output json and if in dev mode
 * @returns A prismy compatible middleware error handler
 *
 * @public
 */
export function createWithErrorHandler({
  dev = false,
  json = false,
  silent = false
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

      if (!silent) {
        console.error(error)
      }

      return json ? res({ message }, statusCode) : res(message, statusCode)
    }
  })
}
