import {
  ErrorResult,
  Result,
  createError,
  createErrorResultFromError,
} from '../src'

describe('createErrorResultFromError', () => {
  it('returns error as it is if the error is PrismyResult', () => {
    // Given
    const error = Result('test')

    // When
    const result = createErrorResultFromError(error)

    // Then
    expect(result).toBe(error)
  })

  it('returns error as it is if the error is PrismyErrorResult', () => {
    // Given
    const error = ErrorResult(403, 'Forbidden')

    // When
    const result = createErrorResultFromError(error)

    // Then
    expect(result).toBe(error)
  })

  it('creates 500 result if the error is unknown', () => {
    // Given
    const error = new Error('Unknown')

    // When
    const result = createErrorResultFromError(error)

    // Then
    expect(result.statusCode).toBe(500)
    expect(result.body).toMatch(/^Error: Unknown/)
  })

  it('uses statusCode if provided', () => {
    // Given
    const error = createError(403, 'Forbidden')

    // When
    const result = createErrorResultFromError(error)

    // Then
    expect(result.statusCode).toBe(403)
    expect(result.body).toMatch(/^Error: Forbidden/)
  })
})
