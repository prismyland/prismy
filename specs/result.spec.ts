import { Redirect, Result, Handler, ErrorResult, PrismyResult } from '../src'
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

describe('Redirect', () => {
  it('redirects', async () => {
    const handler = Handler([], () => Redirect('https://github.com/'))

    const res = await ts.load(handler).call('/', {
      redirect: 'manual',
    })

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('https://github.com/')
  })

  it('sets statusCode', async () => {
    const handler = Handler([], () => Redirect('https://github.com/', 301))

    const res = await ts.load(handler).call('/', {
      redirect: 'manual',
    })

    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('https://github.com/')
  })

  it('sets headers', async () => {
    const handler = Handler([], () =>
      Redirect('https://github.com/', 302, {
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
    const handler = Handler([], () =>
      Result(null)
        .setCookie('testCookie', 'testValue', {
          secure: true,
          domain: 'https://example.com',
        })
        .setCookie('testCookie2', 'testValue2', {
          httpOnly: true,
        }),
    )

    const res = await ts.load(handler).call('/')

    expect(res.status).toBe(200)
    expect(res.headers.getSetCookie()).toEqual([
      'testCookie=testValue; Domain=https://example.com; Secure',
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
