import http from 'http'
import listen from 'async-listen'
import { RequestListener } from 'http'
import { URL } from 'url'
import fetch, { RequestInit } from 'node-fetch'

export type TestCallback = (url: string) => Promise<void> | void

/* istanbul ignore next */
export async function testHandler(
  handler: RequestListener,
  testCallback: TestCallback,
): Promise<void> {
  const server = new http.Server(handler)

  const url: URL = await listen(server)
  try {
    await testCallback(url.origin)
  } catch (error) {
    throw error
  } finally {
    server.close()
  }
}

/* istanbul ignore next */
export function expectType<T>(value: T): void {}

export interface TestFetchOptions {
  method: string
}

export async function testFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, options)
  const testResult = await response.text()

  return {
    statusCode: response.status,
    body: testResult,
  }
}
