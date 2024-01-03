import { Context, Selector, SyncSelector, PrismyHandler } from './types'
import { contextSelector, methodSelector, urlSelector } from './selectors'
import { match as createMatchFunction } from 'path-to-regexp'
import { prismy } from './prismy'
import { createError } from './error'

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
  PrismyHandler<T[]>
]

type Route<T = unknown> = {
  indicator: RouteIndicator
  listener: PrismyHandler<T[]>
}

export function router(
  routes: RouteParams<unknown>[],
  options: PrismyRouterOptions = {}
) {
  const { notFoundHandler } = options
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
  return prismy(
    [methodSelector, urlSelector, contextSelector],
    (method, url, context) => {
      /* istanbul ignore next */
      const normalizedMethod = method?.toLowerCase()
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

        setRouteParamsToPrismyContext(context, result.params)

        return route.listener.contextHandler(context)
      }

      if (notFoundHandler == null) {
        throw createError(404, 'Not Found')
      } else {
        return notFoundHandler.contextHandler(context)
      }
    }
  )
}

function createRoute<T = unknown>(
  routeParams: RouteParams<Selector<T>[]>
): Route<Selector<T>[]> {
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
const routeParamsSymbol = Symbol('route params')

function setRouteParamsToPrismyContext(context: Context, params: object) {
  ;(context as any)[routeParamsSymbol] = params
}

function getRouteParamsFromPrismyContext(context: Context) {
  return (context as any)[routeParamsSymbol]
}

export function createRouteParamSelector(
  paramName: string
): SyncSelector<string | null> {
  return (context) => {
    const param = getRouteParamsFromPrismyContext(context)[paramName]
    return param != null ? param : null
  }
}

interface PrismyRouterOptions {
  notFoundHandler?: PrismyHandler<any[]>
}

function removeTralingSlash(value: string) {
  if (value === '/') {
    return value
  }
  return value.replace(/\/$/, '')
}
