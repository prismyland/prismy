import {
  Selector,
  createInjectDecorators,
  CacheMap
} from '../createInjectDecorators'

export function createCacheMapSelector(): Selector<CacheMap> {
  return (req, res, cacheMap) => {
    return cacheMap
  }
}

export function Cache() {
  return createInjectDecorators(createCacheMapSelector())
}
