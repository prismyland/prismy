import { Redirect, Result, Handler, ErrorResult, PrismyResult } from '../src'
import { testServerManager } from './helpers'

beforeAll(async () => {
  await testServerManager.start()
})

afterAll(async () => {
  await testServerManager.close()
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

      const response = await testServerManager.loadAndCall(handler)
      expect(response.body).toBe('Hola!')
    })

    it('sets status code', async () => {
      const handler = Handler([], () =>
        Result('Hello, World!').setStatusCode(201),
      )

      const response = await testServerManager.loadAndCall(handler)

      expect(response).toMatchObject({
        statusCode: 201,
        body: 'Hello, World!',
      })
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

      const response = await testServerManager.loadAndCall(handler)

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Hello, World!',
      })
      expect(response.headers.get('existing-header')).toBe('Hello')
      expect(response.headers.get('new-header')).toBe('Hola')
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

      const response = await testServerManager.loadAndCall(handler)

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Hello, World!',
      })
      expect(response.headers.get('existing-header')).toBe('Hola')
      expect(response.headers.get('other-existing-header')).toBe('World')
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

      const response = await testServerManager.loadAndCall(handler)

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Hello, World!',
      })
      expect(response.headers.get('existing-header')).toBe(null)
      expect(response.headers.get('new-header')).toBe('Hola')
    })
  })
})

describe('Redirect', () => {
  it('redirects', async () => {
    const handler = Handler([], () => Redirect('https://github.com/'))

    const response = await testServerManager.loadAndCall(handler, '/', {
      redirect: 'manual',
    })

    expect(response).toMatchObject({
      statusCode: 302,
    })
    expect(response.headers.get('location')).toBe('https://github.com/')
  })

  it('sets statusCode', async () => {
    const handler = Handler([], () => Redirect('https://github.com/', 301))

    const response = await testServerManager.loadAndCall(handler, '/', {
      redirect: 'manual',
    })

    expect(response).toMatchObject({
      statusCode: 301,
    })
    expect(response.headers.get('location')).toBe('https://github.com/')
  })

  it('sets headers', async () => {
    const handler = Handler([], () =>
      Redirect('https://github.com/', 302, {
        'custom-header': 'Hello!',
      }),
    )

    const response = await testServerManager.loadAndCall(handler, '/', {
      redirect: 'manual',
    })

    expect(response).toMatchObject({
      statusCode: 302,
    })
    expect(response.headers.get('location')).toBe('https://github.com/')
    expect(response.headers.get('custom-header')).toBe('Hello!')
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

    const response = await testServerManager.loadAndCall(handler, '/')

    expect(response).toMatchObject({
      statusCode: 200,
    })
    expect(response.headers.getSetCookie()).toEqual([
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

    const response = await testServerManager.loadAndCall(handler, '/')

    expect(response).toMatchObject({
      statusCode: 200,
    })
    expect(response.headers.getSetCookie()).toEqual([
      'testCookie=testValue',
      'testCookie2=testValue2',
    ])
  })
})
