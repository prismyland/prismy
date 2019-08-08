<img  width='240' src='https://github.com/prismyland/prismy/blob/master/resources/logo.svg' alt='prismy'>

# `prismy`

:rainbow: Simple and fast type safe server library based on micro for now.sh v2.

[![Build Status](https://travis-ci.com/prismyland/prismy.svg?branch=master)](https://travis-ci.com/prismyland/prismy)
[![codecov](https://codecov.io/gh/prismyland/prismy/branch/master/graph/badge.svg)](https://codecov.io/gh/prismyland/prismy)
[![NPM download](https://img.shields.io/npm/dm/prismy.svg)](https://www.npmjs.com/package/prismy)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/prismyland/prismy.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/prismyland/prismy/context:javascript)

## Features

- Extremely small(No Expressjs)
- Async/Await friendly
- Type-safe(Written in typescript)
- Highly testable(Request handlers can be tested without mocking request or sending actual http requests)
- Better DX
  - Argument injection without decorators(Reselect style)
  - Composable middleware(Redux middleware style)

## Usage

### Installation

```sh
npm i prismy
```

### Implementation

`handler.ts`

```ts
import { prismy, createJSONBodySelector, res } from 'prismy'

const jsonBodySelector = createJSONBodySelector({
  limit: '1mb'
})

export default prismy([jsonBodySelector], async body => {
  await doSomethingWithBody(body)
  return res({
    message: 'Done!'
  })
})
```

`serve.ts`
(If you're using now.sh or next.js, you can just put handlers in `pages` without serve script.)

```ts
import handler from './handler'

const server = new http.Server(prismy(handler))

server.listen(8000)
```

```ts
import handler from './handler'

describe('handler', () => {
  it('e2e test', async () => {
    await testHandler(handler, async url => {
      const response = await got.post(url, {
        body: {
          ... // JSON data
        }
      })
      expect(response).toMatchObject({
        statusCode: 200,
        body: '/'
      })
    })
  })

  it('unit test', () => {
    // Prismy handler exposes its original handler function so you can determine what to put manually.
    // It is very useful for unit testing because you don't need to prepare mockup requests or to send actual http requests either.
    const result = handler.handler({
      ... // JSON data
    })

    expect(result).toEqual({
      body: 'Done!',
      headers: {},
      statusCode: 200
    })
  })
})
```

## Concepts

1. Asynchronously pick required values of a handler from context(which having HTTP Request obejct: IncomingMessage).
2. Asynchronously Execute the handler with picked values.
3. PROFIT!!

### Reselect style argument injection

While other server libraries supporting argument injection, like inversifyjs,
nestjs and tachijs, are using parameter decoartors, prismy don't need them.
This might looks good but have several pitfalls.

- Controllers must be declared as class.(But not class expressions)
- Argument injection via the decorators is not type-safe.

```ts
function createController() {
  class GeneratedController {
    // "Decorators are not valid here" compiler error thrown.
    // https://github.com/microsoft/TypeScript/issues/7342
    run(
      // Argument types must be declared carefully because Typescript cannot infer it.
      @Query() query: QueryParams
    ): string {
      return 'Done!'
    }
  }
  return GeneratedController
}
```

```ts
import { prismy, Selector, res, querySelector } from 'prismy'

// This selector picks search string from query.
// If it is undefined, return empty string.
const searchQuerySelector: Selector<string> = context => {
  const query = querySelector(context)
  const { search } = query
  // So this selector always returns string.
  return search == null ? '' : Array.is(search) ? search[0] : search
}

export default prismy(
  [searchQuerySelector],
  // Typescript can infer `search` argument type via the given selector tuple.
  // So you don't need to worry anymore.
  search => {
    await doSomethingWithSearch(search)
    return res('Done!')
  }
)
```

Moreover, you can use Async selector!
Prismy understands async selector out of the box.
It will resolve all selectors right before executing handler.

```ts
import { prismy, Selector, res, querySelector } from 'prismy'

const asyncSearchQuerySelector: Selector<string> = async context => {
  const query = querySelector(context)
  const { search } = query
  return search == null ? '' : Array.is(search) ? search[0] : search
}

export default prismy([searchQuerySelector], search => {
  await doSomethingWithSearch(search)
  return res('Done!')
})
```

### Redux style composable middleware

Like Redux middleware, your middleware can do:

- Something before executing handler(Session)
- Something after executing handler(CORS, Session)
- Something other than executing handler(Routing, Error handling)

```ts
import { prismy, Selector, res, middleware } from 'prismy'

const corsHandler = middleware([], next => async () => {
  const response = await next()
  response.headers['access-control-allow-origin'] = '*'
  return response.hader
})

// Middleware also accepts selectors too for unit test
const urlSelector: Selector<string> = context => context.req.url!
const errorHandler = middleware([urlSelector], next => async url => {
  try {
    return await next()
  } catch (error) {
    return res(`Error from ${url} : ${error.message}`)
  }
})

export default prismy(
  [],
  () => {
    throw new Error('Bang!')
  },
  [corsHandler, errorHandler]
)
```

## APIs

TBD

## License

MIT
