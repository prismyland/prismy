import got from 'got'
import { Before, After, CacheMap, Cache } from '..'
import { testServer } from './testServer'

describe('Before', () => {
  it('sets before middleware', async () => {
    let count = 0
    const spy1 = jest.fn()
    const spy2 = jest.fn()

    @Before((req, res) => {
      spy1(++count)
    })
    class MyHandler {
      execute() {
        spy2(++count)
        return null
      }
    }

    await testServer(MyHandler, async url => {
      await got(url, {
        json: true
      })

      expect(spy1).toBeCalledWith(1)
      expect(spy2).toBeCalledWith(2)
    })
  })

  it('sets multiple before middleware', async () => {
    let count = 0
    const spy1 = jest.fn()
    const spy2 = jest.fn()
    const spy3 = jest.fn()

    @Before(
      (req, res) => {
        spy1(++count)
      },
      (req, res) => {
        spy2(++count)
      }
    )
    class MyHandler {
      execute() {
        spy3(++count)
        return null
      }
    }

    await testServer(MyHandler, async url => {
      await got(url, {
        json: true
      })

      expect(spy1).toBeCalledWith(1)
      expect(spy2).toBeCalledWith(2)
      expect(spy3).toBeCalledWith(3)
    })
  })
})

describe('After', () => {
  it('sets after middleware', async () => {
    let count = 0
    const spy1 = jest.fn()
    const spy2 = jest.fn()

    @After((req, res) => {
      spy1(++count)
    })
    class MyHandler {
      execute() {
        spy2(++count)
        return null
      }
    }

    await testServer(MyHandler, async url => {
      await got(url, {
        json: true
      })

      expect(spy1).toBeCalledWith(2)
      expect(spy2).toBeCalledWith(1)
    })
  })

  it('sets multiple after middleware', async () => {
    let count = 0
    const spy1 = jest.fn()
    const spy2 = jest.fn()
    const spy3 = jest.fn()

    @After(
      (req, res) => {
        spy1(++count)
      },
      (req, res) => {
        spy2(++count)
      }
    )
    class MyHandler {
      execute() {
        spy3(++count)
        return null
      }
    }

    await testServer(MyHandler, async url => {
      await got(url, {
        json: true
      })

      expect(spy1).toBeCalledWith(2)
      expect(spy2).toBeCalledWith(3)
      expect(spy3).toBeCalledWith(1)
    })
  })

  it('shares data between a handler and other middleware via cacheMap', async () => {
    const spy1 = jest.fn()
    const spy2 = jest.fn()
    const keySymbol = Symbol()

    @Before((req, res, cacheMap) => {
      cacheMap.set(keySymbol, 'Hello, World!')
    })
    @After((req, res, cacheMap) => {
      spy2(cacheMap.get(keySymbol))
    })
    class MyHandler {
      execute(@Cache() cacheMap: CacheMap) {
        spy1(cacheMap.get(keySymbol))
        return null
      }
    }

    await testServer(MyHandler, async url => {
      await got(url, {
        json: true
      })

      expect(spy1).toBeCalledWith('Hello, World!')
      expect(spy2).toBeCalledWith('Hello, World!')
    })
  })
})
