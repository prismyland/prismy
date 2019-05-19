# `gum`

:rocket: Easier and faster unit testing toolkit for micro.

## Usage

Implementation

```ts
import gum from 'gum'

export class MyHandler {
  async execute(@selectJsonBody() body: any) {
    await doSomethingWithBody(body)
    return {
      message: 'Done!'
    }
  }
}

export default gum(MyHandler)
```

Unit test

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
