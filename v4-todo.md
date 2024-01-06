# V4 changes(TEMP)

- redesigned router interface
  - introduced route method
  - Removed notFoundHandler option
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
- [x] Simplified middleware interface
  - Before

    ```ts
    (context: Context) => (next: () => Promise<ResObj>) => Promise<ResObj>
    ```

    Now

    ```ts
    (next: () => Promise<ResObj>) => Promise<ResObj>
    ```
- Return without res
- Include prismy-cookie
- Added DI Selector

# Fix router


# Goal

```ts
const serverHandler = router([
  route(routeInfo, [selector], handler),
  route(routeInfo, prismyHandler),
  route(['/deprecated', '*'], ()=> redirect('/')),
  notFoundRoute(() => '*')
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
