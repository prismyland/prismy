import {
  RedirectResult,
  Result,
  Handler,
  ErrorResult,
  PrismyResult,
  PrismyErrorResult,
  isErrorResult,
  assertErrorResult,
  assertNoErrorResult,
  isRedirectResult,
  assertRedirectResult,
  assertNoRedirectResult,
} from '../src'
import { TestServer } from '../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

describe('ErrorResult', () => {
  it('creates error PrismyResult', () => {
    const errorResult = ErrorResult(400, 'Invalid Format')

    expect(errorResult).toBeInstanceOf(PrismyResult)
    expect(errorResult).toBeInstanceOf(PrismyErrorResult)
    expect(errorResult.statusCode).toBe(400)
    expect(errorResult.body).toBe('Invalid Format')
  })
})

describe('PrismyResult', () => {
  describe('#setStatusCode', () => {
    it('set body', async () => {
      const handler = Handler([], () => Result('Hello!').setBody('Hola!'))

      const res = await ts.load(handler).call()

      expect(await res.text()).toBe('Hola!')
    })

    it('sets status code', async () => {
      const handler = Handler([], () =>
        Result('Hello, World!').setStatusCode(201),
      )

      const res = await ts.load(handler).call()

      expect(await res.text()).toBe('Hello, World!')
      expect(res.status).toBe(201)
    })
  })

  describe('#updateHeaders', () => {
    it('adds headers', async () => {
      const handler = Handler([], () =>
        Result('Hello, World!', 200, {
          'existing-header': 'Hello',
        }).updateHeaders({
          'new-header': 'Hola',
        }),
      )

      const res = await ts.load(handler).call()

      expect(await res.text()).toBe('Hello, World!')
      expect(res.status).toBe(200)
      expect(res.headers.get('existing-header')).toBe('Hello')
      expect(res.headers.get('new-header')).toBe('Hola')
    })

    it('replaces existing headers if duplicated, but other headers are still intact', async () => {
      const handler = Handler([], () =>
        Result('Hello, World!', 200, {
          'existing-header': 'Hello',
          'other-existing-header': 'World',
        }).updateHeaders({
          'existing-header': 'Hola',
        }),
      )

      const res = await ts.load(handler).call()

      expect(await res.text()).toBe('Hello, World!')
      expect(res.status).toBe(200)
      expect(res.headers.get('existing-header')).toBe('Hola')
      expect(res.headers.get('other-existing-header')).toBe('World')
    })
  })

  describe('#setHeaders', () => {
    it('replaces headers', async () => {
      const handler = Handler([], () =>
        Result('Hello, World!', 200, {
          'existing-header': 'Hello',
        }).setHeaders({
          'new-header': 'Hola',
        }),
      )

      const res = await ts.load(handler).call()

      expect(await res.text()).toBe('Hello, World!')
      expect(res.status).toBe(200)
      expect(res.headers.get('existing-header')).toBeNull()
      expect(res.headers.get('new-header')).toBe('Hola')
    })
  })
})

describe('isErrorResult', () => {
  it('returns false if result is NOT an error result', () => {
    const result = Result(null)

    const value = isErrorResult(result)

    expect(value).toBe(false)
  })

  it('returns true if result is an error result', () => {
    const result = ErrorResult(400, null)

    const value = isErrorResult(result)

    expect(value).toBe(true)
  })
})

describe('assertErrorResult', () => {
  it('throws error if result is NOT an error result', () => {
    const result = Result(null)
    try {
      assertErrorResult(result)
    } catch (error) {
      expect((error as Error).message).toEqual(
        [
          'The given PrismyResult is NOT an error result.',
          '',
          'Result:',
          JSON.stringify(result, null, 2),
        ].join('\n'),
      )
      return
    }
    throw new Error('must throw')
  })

  it('does not throw if result is an error result', () => {
    const result = ErrorResult(400, null)

    assertErrorResult(result)
  })
})

describe('assertErrorResult', () => {
  it('throws error if result is an error result', () => {
    const result = ErrorResult(400, null)
    try {
      assertNoErrorResult(result)
    } catch (error) {
      expect((error as Error).message).toEqual(
        [
          'The given PrismyResult is an error result.',
          '',
          'Result:',
          JSON.stringify(result, null, 2),
        ].join('\n'),
      )
      return
    }
    throw new Error('must throw')
  })

  it('does not throw if result is NOT an error result', () => {
    const result = Result(null)

    assertNoErrorResult(result)
  })
})

describe('RedirectResult', () => {
  it('redirects', async () => {
    const handler = Handler([], () => RedirectResult('https://github.com/'))

    const res = await ts.load(handler).call('/', {
      redirect: 'manual',
    })

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('https://github.com/')
  })

  it('sets statusCode', async () => {
    const handler = Handler([], () =>
      RedirectResult('https://github.com/', 301),
    )

    const res = await ts.load(handler).call('/', {
      redirect: 'manual',
    })

    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('https://github.com/')
  })

  it('sets headers', async () => {
    const handler = Handler([], () =>
      RedirectResult('https://github.com/', 302, {
        'custom-header': 'Hello!',
      }),
    )

    const res = await ts.load(handler).call('/', {
      redirect: 'manual',
    })

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('https://github.com/')
    expect(res.headers.get('custom-header')).toBe('Hello!')
  })

  it('sets cookies', async () => {
    const handler = Handler([], () => {
      return Result(null)
        .setCookie('testCookie', 'testValue', {
          secure: true,
          domain: 'example.com',
        })
        .setCookie('testCookie2', 'testValue2', {
          httpOnly: true,
        })
    })

    const res = await ts.load(handler).call('/')

    expect(res.status).toBe(200)
    expect(res.headers.getSetCookie()).toEqual([
      'testCookie=testValue; Domain=example.com; Secure',
      'testCookie2=testValue2; HttpOnly',
    ])
  })

  it('appends set cookie header', async () => {
    const handler = Handler([], () =>
      Result(null)
        .updateHeaders({
          'set-cookie': 'testCookie=testValue',
        })
        .setCookie('testCookie2', 'testValue2'),
    )

    const res = await ts.load(handler).call('/')

    expect(res.status).toBe(200)
    expect(res.headers.getSetCookie()).toEqual([
      'testCookie=testValue',
      'testCookie2=testValue2',
    ])
  })
})

describe('isRedirectResult', () => {
  it('returns false if result is NOT an error result', () => {
    const result = Result(null)

    const value = isRedirectResult(result)

    expect(value).toBe(false)
  })

  it('returns true if result is an error result', () => {
    const result = RedirectResult('/')

    const value = isRedirectResult(result)

    expect(value).toBe(true)
  })
})

describe('assertRedirectResult', () => {
  it('throws error if result is NOT an error result', () => {
    const result = Result(null)
    try {
      assertRedirectResult(result)
    } catch (error) {
      expect((error as Error).message).toEqual(
        [
          'The given PrismyResult is NOT a redirect result.',
          '',
          'Result:',
          JSON.stringify(result, null, 2),
        ].join('\n'),
      )
      return
    }
    throw new Error('must throw')
  })

  it('does not throw if result is an error result', () => {
    const result = RedirectResult('/')
    try {
      assertRedirectResult(result)
    } catch (error) {
      throw new Error('must NOT throw')
    }
  })
})

describe('assertRedirectResult', () => {
  it('throws error if result is an error result', () => {
    const result = RedirectResult('/')
    try {
      assertNoRedirectResult(result)
    } catch (error) {
      expect((error as Error).message).toEqual(
        [
          'The given PrismyResult is a redirect result.',
          '',
          'Result:',
          JSON.stringify(result, null, 2),
        ].join('\n'),
      )
      return
    }
    throw new Error('must throw')
  })

  it('does not throw if result is NOT an error result', () => {
    const result = Result(null)
    try {
      assertNoRedirectResult(result)
    } catch (error) {
      throw new Error('must NOT throw')
    }
  })
})
