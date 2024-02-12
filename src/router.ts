import { MaybePromise, PrismyContext, SelectorReturnTypeTuple } from './types'
import { MethodSelector, UrlSelector } from './selectors'
import { match as createMatchFunction } from 'path-to-regexp'
import { getPrismyContext } from './prismy'
import { createError } from './error'
import {
  createPrismySelector,
  PrismySelector,
} from './selectors/createSelector'
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
  listener: PrismyHandler<PrismySelector<unknown>[]>
}

export class PrismyRoute<
  S extends PrismySelector<any>[] = PrismySelector<any>[],
> {
  indicator: RouteIndicator
  handler: PrismyHandler<S>

  constructor(indicator: RouteIndicator, handler: PrismyHandler<S>) {
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

export function Route<S extends PrismySelector<any>[]>(
  indicator: RouteIndicator | string,
  handler: PrismyHandler<S>,
): PrismyRoute<S>
export function Route<S extends PrismySelector<any>[]>(
  indicator: RouteIndicator | string,
  selectors: [...S],
  handlerFunction?: (
    ...args: SelectorReturnTypeTuple<S>
  ) => MaybePromise<PrismyResult>,
  middlewareList?: PrismyMiddleware<PrismySelector<any>[]>[],
): PrismyRoute<S>
export function Route<S extends PrismySelector<any>[]>(
  indicator: RouteIndicator | string,
  selectorsOrPrismyHandler: [...S] | PrismyHandler<S>,
  handlerFunction?: (
    ...args: SelectorReturnTypeTuple<S>
  ) => MaybePromise<PrismyResult>,
  middlewareList?: PrismyMiddleware<PrismySelector<any>[]>[],
): PrismyRoute<S> {
  const handler =
    selectorsOrPrismyHandler instanceof PrismyHandler
      ? selectorsOrPrismyHandler
      : Handler(selectorsOrPrismyHandler, handlerFunction!, middlewareList)
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
  middleware?: PrismyMiddleware<PrismySelector<any>[]>[]
  notFoundHandler?: PrismyHandler
}

function removeTralingSlash(value: string) {
  if (value === '/') {
    return value
  }
  return value.replace(/\/$/, '')
}
