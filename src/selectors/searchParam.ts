import { SyncSelector } from '../types'
import { urlSelector } from './url'

/**
 * Create a selector which resolves the first value of the search param.
 * Using `url.searchParams.get(name)` internally.
 *
 * @example
 * Simple example
 * ```ts
 * // Expecting a request like `/?user_id=123`
 * const prismyHandler = prismy(
 *  [SearchParamSelector('user_id')],
 *  userId => {
 *    doSomethingWithUserId(userId)
 *  }
 * )
 * ```
 *
 * @param name
 * @returns a selector for the search param
 */
export const SearchParamSelector: (
  name: string,
) => SyncSelector<string | null> = (name) => () => {
  const url = urlSelector()

  return url.searchParams.get(name)
}

/**
 * Create a selector which resolves a value list of the search param.
 * Useful when you expect to have multiple values for the same name.
 * Using `url.searchParams.getAll(name)` internally.
 *
 * @example
 * Simple example
 * ```ts
 * // Expecting a request like `/?user_id=123&user_id=456`
 * const prismyHandler = prismy(
 *  [SearchParamSelector('user_id')],
 *  userIdList => {
 *    if (userIdList.length > 0) {
 *      doSomethingWithUserIdList(userIdList)
 *    }
 *  }
 * )
 * ```
 *
 * @param name
 * @returns a selector for the search param list
 */
export const SearchParamListSelector: (
  name: string,
) => SyncSelector<string[]> = (name) => () => {
  const url = urlSelector()

  return url.searchParams.getAll(name)
}
