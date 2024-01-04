# V4 changes(TEMP)

- redesigned router interface
  - introduced route method
  - Removed notFoundHandler option
- Redesign selectors interfaces
  ```ts
  // SelectorFactory, must be `PascalCase`
  const BodySelector: () => Selector<object>

  // Selector, must be `camelCase`
  const bodySelector: Selector<object>

  prismy([
    // Below two are functionally identical. Use whichever style you like.
    BodySelector(),
    bodySelector
  ], handler)
  ```
- `urlSelector` is now retruning WHATWG URL, not legacy `urlObject` to improve security.
- Removed `skipContentTypeCheck` option from `JsonBodySelectorOptions` to improve security.
- One param for one query selector like URL
- Added Symbol to selector to avoid misconfig
- [ ] Adopted async local storage to communicate between selectors, middleware and handlers
  - Added `getPrismyContext` method to get context. (must be used in the scope of selectors, middleware and handlers)
  - Removed `contextSelector`, use `getPrismyContext`
- Simplified middleware interface
  - Before

    ```ts
    (context: Context) => (next: () => Promise<ResObj>) => Promise<ResObj>
    ```

    Now

    ```ts
    (next: () => Promise<ResObj>) => Promise<ResObj>
    ```
- Return without res

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
