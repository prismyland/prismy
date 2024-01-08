import { PrismyContext } from './types'
import { methodSelector, urlSelector } from './selectors'
import { match as createMatchFunction } from 'path-to-regexp'
import { getPrismyContext } from './prismy'
import { createError } from './error'
import {
  createPrismySelector,
  PrismySelector,
} from './selectors/createSelector'
import { PrismyMiddleware } from '.'
import { Handler, PrismyHandler } from './handler'
import { join as joinPath } from 'path'

export type RouteMethod =
  | 'get'
  | 'put'
  | 'patch'
  | 'post'
  | 'delete'
  | 'options'
  | '*'
export type RouteIndicator = [string, RouteMethod]

type Route = {
  indicator: RouteIndicator
  listener: PrismyHandler<PrismySelector<unknown>[]>
}

export class PrismyRoute {
  indicator: RouteIndicator
  listener: PrismyHandler<PrismySelector<unknown>[]>

  constructor(
    indicator: RouteIndicator,
    listener: PrismyHandler<PrismySelector<unknown>[]>,
  ) {
    this.indicator = indicator
    this.listener = listener
  }
}

export function Router(
  routes: PrismyRoute[],
  { prefix = '/', middleware = [], notFoundHandler }: PrismyRouterOptions = {},
) {
  const compiledRoutes = routes.map((route) => {
    const { indicator, listener } = route
    const [targetPath, method] = indicator
    const compiledTargetPath = removeTralingSlash(
      joinPath('/', prefix, targetPath),
    )
    const match = createMatchFunction(compiledTargetPath, { strict: false })
    return {
      method,
      match,
      listener,
      targetPath: compiledTargetPath,
    }
  })

  return Handler(
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

        return route.listener.handle()
      }

      if (notFoundHandler != null) {
        return notFoundHandler.handle()
      }
      throw createError(404, 'Not Found')
    },
    middleware,
  )
}

export function Route(
  indicator: RouteIndicator | string,
  listener: PrismyHandler<PrismySelector<any>[]>,
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

export function RouteParamSelector(
  paramName: string,
): PrismySelector<string | null> {
  return createPrismySelector(() => {
    const context = getPrismyContext()
    const param = getRouteParamsFromPrismyContext(context)[paramName]
    return param != null ? (Array.isArray(param) ? param[0] : param) : null
  })
}

interface PrismyRouterOptions {
  prefix?: string
  middleware?: PrismyMiddleware<any[]>[]
  notFoundHandler?: PrismyHandler
}

function removeTralingSlash(value: string) {
  if (value === '/') {
    return value
  }
  return value.replace(/\/$/, '')
}
