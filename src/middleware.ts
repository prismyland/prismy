import { IncomingMessage, ServerResponse } from 'http'

export type Middleware = (req: IncomingMessage, res: ServerResponse) => void

export interface MiddlewareMeta {
  before: Middleware[]
  after: Middleware[]
}

const middlewareMetaMap = new Map<any, MiddlewareMeta>()

export function getMiddlewareMeta(target: any): MiddlewareMeta {
  let middlewareMeta = middlewareMetaMap.get(target.constructor)
  if (middlewareMeta == null) {
    middlewareMeta = {
      before: [],
      after: []
    }
    middlewareMetaMap.set(target.constructor, middlewareMeta)
  }
  return middlewareMeta
}

export function setBeforeMiddleware(target: any, middleware: Middleware) {
  const { before } = getMiddlewareMeta(target)
  before.push(middleware)
}

export function setAfterMiddleware(target: any, middleware: Middleware) {
  const { after } = getMiddlewareMeta(target)
  after.push(middleware)
}

export function Before(...middlewareList: Middleware[]) {
  return function appendBeforeMiddleware(target: any) {
    middlewareList.forEach(middleware => {
      setBeforeMiddleware(target, middleware)
    })
  }
}

export function After(...middlewareList: Middleware[]) {
  return function appendAfterMiddleware(target: any) {
    middlewareList.forEach(middleware => {
      setAfterMiddleware(target, middleware)
    })
  }
}
