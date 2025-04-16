import getRawBody from 'raw-body'
import { Result, getPrismyContext, Handler } from '../src'
import { readBufferBody, readJsonBody, readTextBody } from '../src/bodyReaders'
import { TestServer } from '../src/test'

const ts = TestServer()

beforeAll(async () => {
  await ts.start()
})

afterAll(async () => {
  await ts.close()
})

describe('readBufferBody', () => {
  it('reads buffer body from a request', async () => {
    const targetBuffer = Buffer.from('Hello, world!')
    const handler = Handler([], async () => {
      const { req } = getPrismyContext()

      const body = await readBufferBody(req)

      return Result(body)
    })

    const res = await ts.load(handler).call('/', {
      method: 'post',
      body: targetBuffer,
    })
    const resBuffer = Buffer.from(await res.arrayBuffer())
    expect(resBuffer.equals(targetBuffer)).toBeTruthy()
    expect(res.headers.get('content-length')).toBe(
      targetBuffer.length.toString(),
    )
  })

  it('returns cached buffer if it has been read already', async () => {
    const targetBuffer = Buffer.from('Hello, world!')
    const handler = Handler([], async () => {
      const { req } = getPrismyContext()
      const body1 = await readBufferBody(req)
      const body2 = await readBufferBody(req)

      return Result({
        isCached: body1 === body2,
      })
    })

    const res = await ts.load(handler).call('/', {
      method: 'post',
      body: targetBuffer,
    })

    expect(await res.json()).toEqual({
      isCached: true,
    })
  })

  it('throws 413 error if the request body is bigger than limits', async () => {
    const targetBuffer = Buffer.from(
      'Peter Piper picked a peck of pickled peppers',
    )

    const handler = Handler([], async () => {
      const { req } = getPrismyContext()
      const body = await readBufferBody(req, { limit: '1 byte' })

      return Result(body)
    })

    const res = await ts.load(handler).call('/', {
      method: 'post',
      body: targetBuffer,
    })
    expect(await res.text()).toContain(
      'Error: Body is too large (limit: 1 byte)',
    )
    expect(res.status).toBe(413)
  })

  it('throws 400 error if encoding of request body is invalid', async () => {
    const targetBuffer = Buffer.from('Hello, world!')
    const handler = Handler([], async () => {
      const { req } = getPrismyContext()
      const body = await readBufferBody(req, { encoding: 'lol' })

      return Result(body)
    })

    const res = await ts.load(handler).call('/', {
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      body: targetBuffer,
    })

    expect(await res.text()).toContain('Invalid body')
    expect(res.status).toBe(400)
  })

  it('throws 500 error if the request is drained already', async () => {
    const targetBuffer = Buffer.from('Oops!')
    const handler = Handler([], async () => {
      const { req } = getPrismyContext()
      const length = req.headers['content-length']
      await getRawBody(req, { limit: '1mb', length })
      const body = await readBufferBody(req)

      return Result(body)
    })

    const res = await ts.load(handler).call('/', {
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      body: targetBuffer,
    })

    expect(await res.text()).toContain('The request has already been drained')
  })
})

describe('readTextBody', () => {
  it('reads text from request body', async () => {
    const targetBuffer = Buffer.from('Hello, World!')
    const handler = Handler([], async () => {
      const { req } = getPrismyContext()
      const body = await readTextBody(req)

      return Result(body)
    })

    const res = await ts.load(handler).call('/', {
      method: 'post',
      body: targetBuffer,
    })

    expect(await res.text()).toBe('Hello, World!')
    expect(res.headers.get('content-length')).toBe(
      targetBuffer.length.toString(),
    )
  })
})

describe('readJsonBody', () => {
  it('reads and parse JSON from a request body', async () => {
    const targetObject = {
      foo: 'bar',
    }
    const stringifiedTargetObject = JSON.stringify(targetObject)
    const handler = Handler([], async () => {
      const { req } = getPrismyContext()
      const body = await readJsonBody(req)

      return Result(body)
    })

    const res = await ts.load(handler).call('/', {
      method: 'post',
      body: stringifiedTargetObject,
    })

    expect(await res.text()).toEqual(stringifiedTargetObject)
    expect(res.headers.get('content-length')).toBe(
      stringifiedTargetObject.length.toString(),
    )
  })

  it('throws 400 error if the JSON body is invalid', async () => {
    const target = 'Oopsie! This is definitely not a JSON body'
    const handler = Handler([], async () => {
      const { req } = getPrismyContext()
      const body = await readJsonBody(req)

      return Result(body)
    })

    const res = await ts.load(handler).call('/', {
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      body: target,
    })

    expect(await res.text()).toContain('Invalid JSON')
    expect(res.status).toBe(400)
  })
})
