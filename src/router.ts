import { MaybePromise, PrismyContext, SelectorReturnTypeTuple } from './types'
import { MethodSelector, UrlSelector } from './selectors'
import { match as createMatchFunction } from 'path-to-regexp'
import { getPrismyContext } from './prismy'
import { createError } from './error'
import { createPrismySelector, PrismySelector } from './selector'
import { PrismyMiddleware, PrismyResult } from '.'
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
  listener: PrismyHandler<PrismyResult<unknown>, PrismySelector<unknown>[]>
}

export class PrismyRoute<
  R extends PrismyResult<any> = PrismyResult<any>,
  S extends PrismySelector<any>[] = PrismySelector<any>[],
> {
  indicator: RouteIndicator
  handler: PrismyHandler<R, S>

  constructor(indicator: RouteIndicator, handler: PrismyHandler<R, S>) {
    this.indicator = indicator
    this.handler = handler
  }
}

export function Router(
  routes: PrismyRoute[],
  { prefix = '/', middleware = [], notFoundHandler }: PrismyRouterOptions = {},
) {
  const compiledRoutes = routes.map((route) => {
    const { indicator, handler: listener } = route
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
    [MethodSelector(), UrlSelector()],
    (method, url) => {
      const prismyContext = getPrismyContext()
      /* v8 ignore next */
      const normalizedMethod = method != null ? method.toLowerCase() : null
      /* v8 ignore next */
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

        return route.listener.__internal__handler()
      }

      if (notFoundHandler != null) {
        return notFoundHandler.__internal__handler()
      }
      throw createError(404, 'Not Found')
    },
    middleware,
  )
}
export function Route<
  R extends PrismyResult<any>,
  S extends PrismySelector<any>[],
>(
  indicator: RouteIndicator | string,
  handler: PrismyHandler<R, S>,
): PrismyRoute<R, S>
export function Route<
  R extends PrismyResult<any>,
  S extends PrismySelector<any>[],
>(
  indicator: RouteIndicator | string,
  handler: (...args: SelectorReturnTypeTuple<S>) => MaybePromise<R>,
  middlewareList?: PrismyMiddleware<PrismySelector<any>[]>[],
): PrismyRoute<R, S>
export function Route<
  R extends PrismyResult<any>,
  S extends PrismySelector<any>[],
>(
  indicator: RouteIndicator | string,
  selectors: [...S],
  handlerFunction?: (...args: SelectorReturnTypeTuple<S>) => MaybePromise<R>,
  middlewareList?: PrismyMiddleware<PrismySelector<any>[]>[],
): PrismyRoute<R, S>
export function Route(
  indicator: RouteIndicator | string,
  selectorsOrPrismyHandler: any,
  handlerFunction?: any,
  middlewareList?: any,
): PrismyRoute<PrismyResult, any[]> {
  const handler =
    selectorsOrPrismyHandler instanceof PrismyHandler
      ? selectorsOrPrismyHandler
      : Array.isArray(selectorsOrPrismyHandler)
        ? Handler(selectorsOrPrismyHandler, handlerFunction!, middlewareList)
        : Handler([], selectorsOrPrismyHandler, handlerFunction)
  if (typeof indicator === 'string') {
    return new PrismyRoute([indicator, 'get'], handler)
  }
  return new PrismyRoute(indicator, handler)
}

const routeParamsMap = new WeakMap()

function setRouteParamsToPrismyContext(context: PrismyContext, params: object) {
  routeParamsMap.set(context, params)
}

function getRouteParamsFromPrismyContext(context: PrismyContext) {
  return routeParamsMap.get(context)
}

function resolveRouteParam(paramName: string) {
  const context = getPrismyContext()
  const param = getRouteParamsFromPrismyContext(context)[paramName]
  return param != null ? (Array.isArray(param) ? param[0] : param) : null
}

export function RouteParamSelector(paramName: string): PrismySelector<string> {
  return createPrismySelector(() => {
    const resolvedParam = resolveRouteParam(paramName)
    if (resolvedParam == null) {
      throw createError(404, `Route parameter ${paramName} not found`)
    }
    return resolvedParam
  })
}

export function OptionalRouteParamSelector(
  paramName: string,
): PrismySelector<string | null> {
  return createPrismySelector(() => {
    return resolveRouteParam(paramName)
  })
}

interface PrismyRouterOptions {
  prefix?: string
  middleware?: PrismyMiddleware<PrismySelector<any>[]>[]
  notFoundHandler?: PrismyHandler
}

function removeTralingSlash(value: string) {
  if (value === '/') {
    return value
  }
  return value.replace(/\/$/, '')
}
