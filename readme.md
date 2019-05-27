<img  width='240' src='./resources/logo.svg' alt='prismy'>

# `prismy`

:rainbow: Simple and fast type safe server library based on micro for now.sh v2.

## Usage

### Installation

```sh
npm i micro prismy tslib
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

1. Create `index.ts`

```ts
import { prismy, JsonBody } from 'prismy'

export class MyHandler {
  async execute(@JsonBody() body: any) {
    await doSomethingWithBody(body)
    return {
      message: 'Done!'
    }
  }
}

// prismy will returns request handler for micro.
export default prismy(MyHandler)
```

2. Compile `index.ts` to `index.js`

3. Start `micro`

```sh
micro index.js
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
