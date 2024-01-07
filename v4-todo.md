# V4 changes(TEMP)
- Legacy support: Provide snippets which can provide compatibility
- [x] Improve server test(Replace legacy got with node-fetch@2)
  - server listner replacer?
- Introduce tsd to test types properly
- [x] Seperate Handler and Prismy
  ```ts
  import http from 'http'

  // Take handler
  const requestListener: http.RequestListener = prismy(Handler([...], () => {}))
  // Can omit Handler
  // const serverHandler = Prismy([...], () => {})

  http.createServer(requestListener).listen()

  ```
- [x] redesigned router interface
  - [x] introduced route method
  - [ ] Add combine router to put routers together
    - [ ] NotFoundHandler must be ignored when routers are combined.
      - Should roll back NotFoundHandler
      - combineRouters should take NotFoundHandler
  - [ ] Add tests
    - [ ] Wildcard parm handling
    - [ ] Router middleware test
- [ ] Replace res with `PrismyResult` and `Result()`
- [x] Redesigned selector interface
  - [x] Renamed factory method (ex: createBodySelector(Deprecated) => BodySelector)
  ```ts
  import { BodySelector } from 'prismy'
  // Use `camelCase` when naming a created selector.
  const bodySelector = BodySelector()

  prismy([
    // Below two are functionally identical. Use whichever style you like.
    BodySelector(),
    bodySelector
  ], handler)
  ```
  - [x] Changed selector interface and its name
    - [x] Removed `Selector`, `SyncSelector` and `AsyncSelector` interface. Use `PrismySelector`
    - [x] Selector is not a function anymore. It must be extends from `PrismySelector` Class.
      - So typescript can throws an error if any of selectors in `prismy([...selectors], handler)` is not valid.
      ```ts
      // If the selector interface were a function, the statement below won't throw any type error although it is incorrect.
      prismy([
        BodySelector(), // `() => Body` this function is a selector.
        BodySelector // `() => PrismySelector`, this function creates a selector when called but definitely not a selector by itself.
      ])
      ```
      - To create a custom selector, you must use `createPrismySelector`
      ```ts
      function selectSomethingFromContext(context: PrismyContext): T

      // Previous
      const legacySelector: Selector<T> = (context): T | Promise<T> => {
        const selected = selectSomethingFromContext(context)
        return selected
      }

      // Now
      const newSelector = createPrismySelector(() => {
        const context = getPrismyContext()
        const selected = selectSomethingFromContext(context)
        return selected
      })
      ```
- [x] `urlSelector` is now retruning WHATWG URL, not legacy `urlObject` to improve security.
- [x] Removed `skipContentTypeCheck` option from `JsonBodySelectorOptions` to improve security.
- [x] One param for one query selector like URL
- [x] Adopted async local storage to communicate between selectors, middleware and handlers
  - [x] Added `getPrismyContext` method to get context. (must be used in the scope of selectors, middleware and handlers)
  - [x] Removed `contextSelector`, use `getPrismyContext`
- [ ] Add `createConcurrentSelector(...selectors: PrismySelector[])`
- [x] Simplified middleware interface
  - Before

    ```ts
    (context: Context) => (next: () => Promise<ResObj>) => Promise<ResObj>
    ```

    Now

    ```ts
    (next: () => Promise<ResObj>) => Promise<ResObj>
    ```
- [ ] Make middleware into a class
- [ ] Return without res
- [ ] Include prismy-cookie
- [ ] Added DI Selector

# Fix router

# Goal

```ts
import {Router, Route} from 'prismy'
const serverHandler = Router([
  Route(routeInfo, [selector], handler),
  Route(routeInfo, prismyHandler),
  Route(['/deprecated', '*'], ()=> redirect('/')),
  NotFoundRoute(() => res('Not Found', 404))
], {
  prefix: '...'
  middleware: [...],
})

router([
  route(),
  notFoundRoute()
], {
  prefix: '...'
  middleware: [...],

})


combineRouters(
...routers
)

interface NodeServerHandler {
  (req: Req, res: Res): void
}

interface PrismyHandler extends NodeServerHandler{
  selectors: []
  handler: () => void
  middleware: Middleware[]
}

type Retunnable =

```

subdomain routing
Dont use context anymore. Async storage is enough.

Inject symbol to selectors to prevent mistake


## Callstack

```ts
const handler = Handler([s1, s2, s3], (v1, v2, v3) => {
  return res
}, [m1, m2, m3])
```

`m3 { m2 { m1 { s1 -> s2 -> s3 -> handler } } }`

Middleware can:
- Do something before running its inner middleware and handler (Validating token, Retrieving session)
- Do something after running its inner middleware and handler (Rotating cookie, Handling an error)
- Skip running its inner middleware and handler (When token validation fails, should throw an error)

But it cannot control its outer middleware

```ts
const middleware = Middleware([], next => async () => {
  // Do something before the handler is triggered
  const result = doSomethingBefore()
  if (isBad(result)) {
    // Skip running `next` handler
    return res()
  }
  const result = await next()

  // Do something after the handler is triggered
  doSomethingAfter()

  return result
})
```

### Middleware order

Later is the outer.
Outer has more responsibility.

```ts
[sessionMiddleware, ...., loggingMiddleware, errorMiddleware]
```

### Selector order

First one goes first.
If the first one fails, latter ones never triggered.

If selectors don't cause side effect, you can even run them concurrently.
