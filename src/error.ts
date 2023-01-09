import { res } from './utils'

/**
 * Creates a response object from an error
 *
 * @remarks
 * Convert an error into a simpe response object.
 *
 * @param error - Options including whether to output json and if in dev mode
 * @returns An error response object
 *
 * @public
 */
export function createErrorResObject(error: any) {
  const statusCode = error.statusCode || error.status || 500
  /* istanbul ignore next */
  const message =
    process.env.NODE_ENV === 'production' ? error.message : error.stack

  return res(message, statusCode)
}

class PrismyError extends Error {
  statusCode?: number
  originalError?: unknown
}

export function createError(
  statusCode: number,
  message: string,
  originalError?: any
): PrismyError {
  const error = new PrismyError(message)

  error.statusCode = statusCode
  error.originalError = originalError
  return error
}
