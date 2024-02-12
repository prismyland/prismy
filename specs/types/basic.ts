import {
  BodySelector,
  Handler,
  MaybePromise,
  MethodSelector,
  Middleware,
  prismy,
  PrismyHandler,
  PrismyNextFunction,
  PrismyResult,
  PrismyRoute,
  Result,
  Route,
  UrlSelector,
} from '../../src'
import http from 'http'
import { InjectSelector } from '../../src/selectors/inject'
import { PrismySelector } from '../../src/selectors/createSelector'

function expectType<T>(value: T): void {}

const handler1 = Handler([UrlSelector(), MethodSelector()], (url, method) => {
  expectType<URL>(url)
  expectType<string | undefined>(method)
  return Result('')
})

expectType<
  (
    url: URL,
    method: string | undefined,
    url2: URL,
  ) => PrismyResult | Promise<PrismyResult>
>(handler1.handlerFunction)

expectType<PrismyHandler>(Handler([BodySelector()], () => Result(null)))

http.createServer(prismy(handler1))

// @ts-expect-error
Handler([BodySelector], () => Result(null))

const middleware1 = Middleware(
  [UrlSelector(), MethodSelector()],
  (next) => async (url, method) => {
    expectType<URL>(url)
    expectType<string | undefined>(method)
    return next()
  },
)

expectType<
  (next: PrismyNextFunction) => (url: URL, method: string | undefined) => any
>(middleware1.handler)

// @ts-expect-error
Middleware([BodySelector], () => () => Result(null))

http.createServer(prismy([], () => Result(''), [middleware1]))

abstract class MailService {}
class ProductionMailService extends MailService {}
class TestMailService extends MailService {}

const mailService: MailService =
  process.env.NODE_ENV === 'production'
    ? new ProductionMailService()
    : new TestMailService()

const mailServiceSelector = InjectSelector(mailService)

const handler = Handler([mailServiceSelector], (mailService) => {
  expectType<MailService>(mailService)
  return Result(null)
})

const mailHandlerRoute = Route('/', handler)
expectType<PrismyRoute<[PrismySelector<MailService>]>>(mailHandlerRoute)

const shortRoute = Route(
  '/',
  [UrlSelector(), MethodSelector()],
  (url, method) => {
    expectType<URL>(url)
    expectType<string | undefined>(method)
    return Result(null)
  },
)

expectType<
  PrismyRoute<[PrismySelector<URL>, PrismySelector<string | undefined>]>
>(shortRoute)
expectType<
  (url: URL, method: string | undefined) => MaybePromise<PrismyResult<any>>
>(shortRoute.handler.handlerFunction)
