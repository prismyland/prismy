<img  width='240' src='https://github.com/BoostIO/prismy/blob/master/resources/logo.svg' alt='prismy'>

# `prismy`

:rainbow: Simple and fast type safe server library based on micro for now.sh v2.

[![Build Status](https://travis-ci.com/BoostIO/prismy.svg?branch=master)](https://travis-ci.com/BoostIO/prismy)
[![codecov](https://codecov.io/gh/BoostIO/prismy/branch/master/graph/badge.svg)](https://codecov.io/gh/BoostIO/prismy)
[![NPM download](https://img.shields.io/npm/dm/prismy.svg)](https://www.npmjs.com/package/prismy)
[![Supported by BoostIO](https://github.com/BoostIO/boostio-materials/raw/master/v1/boostio-shield-v1.svg?sanitize=true)](https://boostio.co)

## Usage

### Installation

```sh
npm i prismy tslib
```

> #### Why do I need `tslib`?
>
> It is needed to minimize your app bundle size.
>
> Typescript compiler emits helpers by default to enable fancy ecma syntax which
> your runtime env does not support.
> But the problem is that it will emit duplicated helper code to every module.
> To prevent it, Typescript provides `--importHelpers` option which let
> modules import those helpers from `tslib`.
> So every module of prismy enables the option.
>
> To know more, see https://github.com/microsoft/tslib

### Implementation

```ts
import { prismy, JsonBody } from 'prismy'

export class MyHandler {
  async handle(@JsonBody() body: any) {
    await doSomethingWithBody(body)
    return {
      message: 'Done!'
    }
  }
}

// prismy will returns a request handler for a Node.js HTTP Server.
const server = new http.Server(prismy(handlerClass))

server.listen(8000)
```

### Unit testing

You don't have to mock request to test.

```ts
import { MyHandler } from './MyHandler'

describe('MyHandler', () => {
  it('returns a message', async () => {
    // Given
    const body = {...}

    // When
    const result = new MyHandler().execute(body)

    // Then
    expect(result).toEqual({
      message: 'Done!'
    })
  })
})
```

## License

MIT
