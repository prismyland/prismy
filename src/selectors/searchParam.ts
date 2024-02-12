import { createPrismySelector, PrismySelector } from './createSelector'
import { UrlSelector } from './url'

const urlSelector = UrlSelector()

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
) => PrismySelector<string | null> = (name) =>
  createPrismySelector(async () => {
    const url = await urlSelector.resolve()

    return url.searchParams.get(name)
  })

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
) => PrismySelector<string[]> = (name) =>
  createPrismySelector(async () => {
    const url = await urlSelector.resolve()

    return url.searchParams.getAll(name)
  })
