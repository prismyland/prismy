<img  width='240' src='https://github.com/prismyland/prismy/blob/master/resources/logo.svg' alt='prismy'>

# `prismy`

:rainbow: Simple and fast type safe server library based on micro for now.sh v2.

[![Build Status](https://travis-ci.com/prismyland/prismy.svg?branch=master)](https://travis-ci.com/prismyland/prismy)
[![codecov](https://codecov.io/gh/prismyland/prismy/branch/master/graph/badge.svg)](https://codecov.io/gh/prismyland/prismy)
[![NPM download](https://img.shields.io/npm/dm/prismy.svg)](https://www.npmjs.com/package/prismy)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/prismyland/prismy.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/prismyland/prismy/context:javascript)

## Usage

### Installation

```sh
npm i prismy
```

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
