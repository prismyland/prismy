import { PrismyContext, PrismyHandler } from './types'
import { methodSelector, urlSelector } from './selectors'
import { match as createMatchFunction } from 'path-to-regexp'
import { getPrismyContext, prismy } from './prismy'
import { createError } from './error'
import {
  createPrismySelector,
  PrismySelector,
} from './selectors/createSelector'

export type RouteMethod =
  | 'get'
  | 'put'
  | 'patch'
  | 'post'
  | 'delete'
  | 'options'
  | '*'
export type RouteIndicator = [string, RouteMethod]
export type RouteParams<T = unknown> = [
  string | RouteIndicator,
  PrismyHandler<T[]>,
]

type Route<T = unknown> = {
  indicator: RouteIndicator
  listener: PrismyHandler<T[]>
}

export function router(
  routes: RouteParams<unknown>[],
  options: PrismyRouterOptions = {},
) {
  const compiledRoutes = routes.map((routeParams) => {
    const { indicator, listener } = createRoute(routeParams)
    const [targetPath, method] = indicator
    const compiledTargetPath = removeTralingSlash(targetPath)
    const match = createMatchFunction(compiledTargetPath, { strict: false })
    return {
      method,
      match,
      listener,
      targetPath: compiledTargetPath,
    }
  })
  return prismy([methodSelector, urlSelector], (method, url) => {
    const prismyContext = getPrismyContext()
    /* istanbul ignore next */
    const normalizedMethod = method != null ? method.toLowerCase() : null
    /* istanbul ignore next */
    const normalizedPath = removeTralingSlash(url.pathname || '/')

    for (const route of compiledRoutes) {
      const { method: targetMethod, match } = route
      if (targetMethod !== '*' && targetMethod !== normalizedMethod) {
        continue
      }

      const result = match(normalizedPath)
      if (!result) {
        continue
      }

      setRouteParamsToPrismyContext(prismyContext, result.params)

      return route.listener.contextHandler()
    }

    throw createError(404, 'Not Found')
  })
}

function createRoute<T = unknown>(
  routeParams: RouteParams<PrismySelector<T>[]>,
): Route<PrismySelector<T>[]> {
  const [indicator, listener] = routeParams
  if (typeof indicator === 'string') {
    return {
      indicator: [indicator, 'get'],
      listener,
    }
  }
  return {
    indicator,
    listener,
  }
}

const routeParamsMap = new WeakMap()

function setRouteParamsToPrismyContext(context: PrismyContext, params: object) {
  routeParamsMap.set(context, params)
}

function getRouteParamsFromPrismyContext(context: PrismyContext) {
  return routeParamsMap.get(context)
}

export function routeParamSelector(
  paramName: string,
): PrismySelector<string | null> {
  return createPrismySelector(() => {
    const context = getPrismyContext()
    const param = getRouteParamsFromPrismyContext(context)[paramName]
    return param != null ? param : null
  })
}

interface PrismyRouterOptions {}

function removeTralingSlash(value: string) {
  if (value === '/') {
    return value
  }
  return value.replace(/\/$/, '')
}
