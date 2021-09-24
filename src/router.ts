import { Context, Selector, SyncSelector, PrismyRequestListener } from './types'
import { contextSelector, methodSelector, urlSelector } from './selectors'
import { match as createMatchFunction } from 'path-to-regexp'
import { prismy } from './prismy'
import { createError } from './error'

export type RouteMethod = 'get' | 'put' | 'patch' | 'post' | 'delete' | '*'
export type RouteIndicator = [RouteMethod, string]
export type RouteParams<T = unknown> = [
  string | RouteIndicator,
  PrismyRequestListener<Selector<T>[]>
]

type Route<T = unknown> = {
  indicator: RouteIndicator
  listener: PrismyRequestListener<Selector<T>[]>
}

export function router(
  routes: RouteParams<Selector<any>[]>[],
  options: PrismyRouterOptions = {}
) {
  const { notFoundListener } = options
  const compiledRoutes = routes.map((routeParams) => {
    const { indicator, listener } = createRoute(routeParams)
    const [method, targetPath] = indicator
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
      const normalizedMethod = method?.toLowerCase()
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

      if (notFoundListener == null) {
        throw createError(404, 'Not Found')
      } else {
        return notFoundListener.contextHandler(context)
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
      indicator: ['get', indicator],
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
  return (context as any)[routeParamsSymbol] || {}
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
  notFoundListener?: PrismyRequestListener<any[]>
}

function removeTralingSlash(value: string) {
  if (value === '/') {
    return value
  }
  return value.replace(/\/$/, '')
}
