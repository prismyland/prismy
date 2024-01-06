import { PrismyContext, PrismyHandler } from './types'
import { methodSelector, urlSelector } from './selectors'
import { match as createMatchFunction } from 'path-to-regexp'
import { getPrismyContext, prismy } from './prismy'
import { createError } from './error'
import {
  createPrismySelector,
  PrismySelector,
} from './selectors/createSelector'
import { PrismyMiddleware } from '.'

export type RouteMethod =
  | 'get'
  | 'put'
  | 'patch'
  | 'post'
  | 'delete'
  | 'options'
  | '*'
export type RouteIndicator = [string, RouteMethod]

type Route<T = unknown> = {
  indicator: RouteIndicator
  listener: PrismyHandler<T[]>
}

export class PrismyRoute<T = unknown> {
  indicator: RouteIndicator
  listener: PrismyHandler<T[]>

  constructor(indicator: RouteIndicator, listener: PrismyHandler<T[]>) {
    this.indicator = indicator
    this.listener = listener
  }
}

export function router(
  routes: PrismyRoute<unknown>[],
  { prefix, middleware = [] }: PrismyRouterOptions = {},
) {
  const compiledRoutes = routes.map((route) => {
    const { indicator, listener } = route
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
    [methodSelector, urlSelector],
    (method, url) => {
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
    },
    middleware,
  )
}

export function Route<T = unknown>(
  indicator: RouteIndicator | string,
  listener: PrismyHandler<T[]>,
): PrismyRoute {
  if (typeof indicator === 'string') {
    return new PrismyRoute([indicator, 'get'], listener)
  }
  return new PrismyRoute(indicator, listener)
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

interface PrismyRouterOptions {
  prefix?: string
  middleware?: PrismyMiddleware<any[]>[]
}

function removeTralingSlash(value: string) {
  if (value === '/') {
    return value
  }
  return value.replace(/\/$/, '')
}
