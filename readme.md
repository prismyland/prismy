<img  width='240' src='resources/logo.svg' alt='prismy'>

# `prismy`

:rainbow: Simple and fast type safe server library based on micro for now.sh v2.

[![Build Status](https://travis-ci.com/prismyland/prismy.svg?branch=master)](https://travis-ci.com/prismyland/prismy)
[![codecov](https://codecov.io/gh/prismyland/prismy/branch/master/graph/badge.svg)](https://codecov.io/gh/prismyland/prismy)
[![NPM download](https://img.shields.io/npm/dm/prismy.svg)](https://www.npmjs.com/package/prismy)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/prismyland/prismy.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/prismyland/prismy/context:javascript)

[Full API Documentation](https://prismyland.github.io/prismy/globals.html)

## Index

- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Hello World](#hello-world)
- [Guide](#guide)
  - [Context](#context)
  - [Selectors](#selectors)
  - [Middleware](#middleware)
  - [Session](#session)
  - [Cookies](#cookies)
  - [Method Routing](#method-routing)
- [Example](#simple-example)
- [Testing](#writing-tests)
- [Gotchas](#gotchas-and-troubleshooting)

## Concepts

1. _Asynchronously_ pick required values of a handler from context(which having HTTP Request object: IncomingMessage).
2. _Asynchronously_ execute the handler with the picked values.
3. **PROFIT!!**

## Features

- Very small (No Expressjs, the only deps are micro and tslib)
- Takes advantage of the asynchronous nature of Javascript with full support for async / await
- Simple and easy argument injection for handlers (Inspired by ReselectJS)
  - Completely **TYPE-SAFE**
  - No more complicated classes / decorators, only simple functions
  - Highly testable (Request handlers can be tested without mocking request or sending actual http requests)
- Single pass (lambda) style composable middleware (Similar to Redux)

## Getting Started

### Installation

Create a package.json file.

```sh
npm init
```

Install prismy.

```sh
npm install prismy --save
```

Make sure typescript strict setting is on if using typescript.

`tsconfig.json`

```json
{
  "strict": true
}
```

### Hello World

`handler.ts`

```ts
import { prismy, res, Selector } from 'prismy'

const worldSelector: Selector<string> = () => 'world'!

export default prismy([worldSelector], async world => {
  return res(`Hello ${world}`) // Hello world!
})
```

If you are using now.sh or next.js you can just put handlers in the `pages` directory and your done!
Simple, easy, no hassle.

Otherwise, serve your application using node.js http server.

`serve.ts`

```ts
import handler from './handler'
import * as http from 'http'

const server = new http.Server(handler)

server.listen(8000)
```

For more in-depth application see the more in-depth [Example.](#simple-example)

## Guide

### Context

`context` is a simple plain object containing native node.js's request instance, `IncomingMessage`.

```ts
interface Context {
  req: IncomingMessage
}
```

Context is passed into all selectors and middlewares. It can be used to assist memoization and communicate between linked selectors and middlewares.

:exclamation: **It is highly recommended to use `Symbol('property-name')` in order to prevent duplicating property names and end up overwriting something important.**
Read more about Symbols [here.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)

This way of communicating via symbols on the context object is used in `prismy-session`.

:exclamation: Due to how prismy resolves selectors, context should **NOT** be used to communicate between selectors. Due to its async nature resolution order cannot be guaranteed.

### Selectors

Many other server libraries support argument injection through the use of
decorators e.g InversifyJS, NestJS and TachiJS.
Decorators can seem nice and clean but have several pitfalls.

- Controllers must be declared as class. (But not class expressions)
- Argument injection via decorators is not type-safe.

An example controller in NestJS:

```ts
function createController() {
  class GeneratedController {
    /**
     * Using decorators in class expression is not allowed yet.
     * So compiler will throw an error.
     * https://github.com/microsoft/TypeScript/issues/7342
     * */
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

Prismy however uses _Selectors_, a pattern inspired by ReselectJS.
Selectors are simple functions used to generate the arguments for the handler. A Selector accepts a
single `context` argument or type `Context`.

```ts
import { prismy, res, Selector } from 'prismy'

// This selector picks the current url off the request object
const urlSelector: Selector<string> = context => {
  const url = context.req.url
  // So this selector always returns string.
  return url != null ? url : ''
}

export default prismy(
  [urlSelector],
  // Typescript can infer `url` argument type via the given selector tuple
  // making it type safe without having to worry about verbose typings.
  url => {
    await doSomethingWithUrl(url)
    return res('Done!')
  }
)
```

Async selectors are also fully supported out of the box!
It will resolve all selectors right before executing handler.

```ts
import { prismy, res, Selector } from 'prismy'

const asyncSelector: Selector<string> = async context => {
  const value = await readValueFromFileSystem()
  return value
}

export default prismy(
  [asyncSelector],
  async value => {
    await doSomething(value)
    return res('Done!')
  }
)
```

#### Included Selectors

Prismy includes some helper selectors for common actions.
Some examples are:

- `methodSelector`
- `querySelector`

Others require configuration and so factory functions are exposed.

- `createJsonBodySelector`
- `createUrlEncodedBodySelector`

```ts
import { createJsonBodySelector } from 'prismy'

// createJsonBodySelector returns an AsyncSelector<any>
const jsonBodySelector = createJsonBodySelector({
  limit: '1mb'
})

export default prismy(
  [jsonBodySelector],
  async jsonBody => {
    await doSomething(jsonBody)
    return res('Done!')
  }
)
```

These helper selectors can be composed to provide more solid typing and error handling.

```ts
import { createJsonBodySelector, Selector } from 'prismy'

interface RequestBody {
  data: string
  id?: number
}

const jsonBodySelector = createJsonBodySelector()

const requestBodySelector: Selector<RequestBody> = context => {
  const jsonBody = jsonBodySelector(context)
  if (!jsonBody.hasOwnProperty('data')) {
    throw new Error('Query is required!')
  }
  return jsonBody
}

export default prismy(
  [requestBodySelector],
  requestBody => {
    return res(`You're query was ${requestBody.json}!`)
  }
)
```

For other helper selectors, please refer to the [API Documentation.](#api)

### Middleware

Middleware in Prismy works as a single pass pipeline of composed functions. The next middleware is
accepted as an argument to the previous middleware allowing the request to be progressed or returned as desired.
The middleware stack is composed and so the response travels right to left across the array.

This pattern, much like Redux middleware, allows you to:

- Do something before executing handler (e.g Session)
- Do something after executing handler (e.g CORS, Session)
- Do something other than executing handler (e.g Routing, Error handling)

```ts
import { middleware, prismy, res, Selector, updateHeaders } from 'prismy'

const withCors = middleware([], next => async () => {
  const resObject = await next()

  return updateHeaders(resObject, {
    'access-control-allow-origin': '*'
  })
})

// Middleware also accepts selectors which can be used for DI and unit testing
const urlSelector: Selector<string> = context => context.req.url!
const withErrorHandler = middleware([urlSelector], next => async url => {
  try {
    return await next()
  } catch (error) {
    return res(`Error from ${url}: ${error.message}`)
  }
})

export default prismy(
  [],
  () => {
    throw new Error('Bang!')
  },
  /**
   * The request will progress through the middleware stack like so:
   * withErrorHandler => withCors => handler => withCors => withErrorHandler
   * */
  [withCors, withErrorHandler]
)
```

### Session

Although you can implement your own sessions using selectors and middleware, Prismy offers a
simple module to make it easy with `prismy-session`.

Install it using:

```sh
npm install prismy-session --save
```

`prismy-session` exposes `createSession` which accepts a `SessionStrategy` instance and returns a
selector and middleware to give to prismy.
Official strategies include `prismy-session-strategy-jwt-cookie` and `prismy-session-strategy-signed-cookie`. Both available on npm.

```ts
import { prismy, res } from 'prismy'
import createSession from 'prismy-session'
import JWTSessionStrategy from 'prismy-session-strategy'

const { sessionSelector, sessionMiddleware } = createSession(
  new JWTSessionStrategy({
    secret: 'RANDOM_HASH'
  })
)

default export prismy(
  [sessionSelector],
  async session => {
    const { data } = session
    await doSomething(data)
    return res('Done')
  },
  [sessionMiddleware]
)

```

### Cookies

Prismy also offers a selector for cookies in the `prismy-cookie` package.

```ts
import { prismy, res } from 'prismy'
import { appendCookie, createCookiesSelector } from 'prismy-cookie'

const cookiesSelector = createCookiesSelector()

export default prismy(
  [cookiesSelector],
  async cookies => {
    /** appendCookie is a helper function that takes a response object and
     * a string key, value tuple returning a new response object with the
     * cookie appended.
     */
    return appendCookie(res('Cookie added!'), ['key', 'value'])
  }
)
```

### Method Routing

Dealing with the different HTTP methods using just a methodSelector can get arduous. As such `prismy-method-router` is available to make it easier and smoother.

```ts
import { prismy, res } from 'prismy'
import { methodRouter } from 'prismy-method-router'

export default methodRouter(
  {
    get: prismy([], () => {
      return res('Got something!')
    }),
    post: prismy([], () => {
      return res('Posted something!')
    })
  },
  [
    /* common middleware can be past in here */
  ]
)
```

`methodRouter` supports all HTTP verbs.

## Simple Example

```ts
import {
  createJsonBodySelector,
  middleware,
  prismy,
  querySelector,
  redirect,
  res,
  Selector
} from 'prismy'
import { methodRouter } from 'prismy-method-router'
import createSession from 'prismy-session'
import JWTSessionStrategy from 'prismy-session-strategy-jwt-cookie'

const jsonBodySelector = createJsonBodySelector({
  limit: '1mb'
})

const { sessionSelector, sessionMiddleware } = createSession(
  new JWTSessionStrategy({
    secret: 'RANDOM_HASH'
  })
)

const authSelector: Selector<User> = async context => {
  const { data } = await sessionSelector(context)
  const user = await getUser(data.user_id)
  return user
}

const authMiddleware = middleware([authSelector], next => async user => {
  if (!isAuthorized(user)) {
    return redirect('/login')
  }
  return next()
})

const todoIdSelector: Selector<string> = async context => {
  const query = await querySelector(context)
  const { id } = query
  if (id == null) {
    throw new Error('Id is required!')
  }
  return Array.isArray(id) ? id[0] : id
}

const contentSelector: Selector<string> = async context => {
  const jsonBody = await jsonBodySelector(context)
  const { content } = jsonBody
  if (content == null) {
    throw new Error('content is required!')
  }
  return jsonBody.content
}

export default methodRouter(
  {
    get: prismy([], async () => {
      const todos = await getTodos()
      return res({ todos })
    }),
    post: prismy([contentSelector], async content => {
      const todo = await createTodo(content)
      return res({ todo })
    }),
    delete: prismy([todoIdSelector], async id => {
      await deleteTodo(id)
      return res('Deleted')
    })
  },
  [authMiddleware, sessionMiddleware]
)
```

## Writing Tests

Prismy is designed to be easily testable. To furthur ease testing `prismy-test` exposes the `testHandler` function to create quick and easy end to end tests.

### E2E Tests

End to end tests are very simple.

```ts
import got from 'got'
import { testHandler } from "prismy-test"
import handler from './handler'

describe('handler', () => {
  it('e2e test', async () => {
    await testHandler(handler, async url => {
      const response = await got(url, {
        method: 'POST',
        responseType: 'json',
        json: {
          ... // JSON data
        }
      })
      expect(response).toMatchObject({
        statusCode: 200,
        body: '/'
      })
    })
  })
})
```

### Unit Tests

Thanks to Prismy's simple, function-based architecture unit testing in Prismy is extremely simple.
Prismy handler exposes its original handler function so you can directly unit test the handler function even if it is an anonymous function argument to `prismy` without needing to mock http requests.

```ts
import handler from './handler'

decribe('handler', () => {
  it('unit test', () => {
    /**
     * Access the original handler function
     * */
    const result = handler.handler({
      ... // whatever arguments you want to test with
    })

    expect(result).toEqual({
      body: 'Done!',
      headers: {},
      statusCode: 200
    })
  })
})
```

## Gotchas and Troubleshooting

### Long `type is not assignable to [Selector<unknown> ...` error when creating Prismy handler

- Selectors must be written directly into the array argument in the function call. This is due to a limitation of Typescript type inference. Prismy relies on knowning the tuple type of the array, e.g `[string, number]`. Dynamicly creating the array will infer as `string|number[]` which means Prismy cannot infer the positional types for the handler arguments.

```ts
const selectors = [selector1, selector2]
prismy(selectors, handler) // will give type error

prismy([selector1, selector2], handler) // Ok!
```

- This weird type error may also occur if the handler does not return a `ResponseObject`. Use `res(..)` to generate a `ResponseObject` easily.

```ts
// Will show crazy error.
prismy([selector1, selector2], (one, two) => {
  return 'Not a ResponseObject'
})

// Ok!
prismy([selector1, selector2], (one, two) => {
  return res('Is a ResponseObject')
})
```

### Long `type is not assignable to [Selector<unknown> ...` error when creating middleware

- mhandler argument must be of `type next => async () => T`. Remember the async.
- If using Typescript, `'strict'` compiler option MUST be `true`. This can be set in tsconfig.json.

<!-- TODO: add api docs -->

## License

MIT
