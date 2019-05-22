<img  width='240' src='../../resources/logo.svg' alt='Prismy'>

# `prismy`

:rocket: Simple and fast type safe server library based on micro for now.sh v2.

## Usage

### Installation

```sh
npm i micro prismy
```

### Implementation

1. Create `index.ts`

```ts
import { prismy, injectJsonBody } from 'prismy'

export class MyHandler {
  async execute(@injectJsonBody() body: any) {
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
