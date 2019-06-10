import got from 'got'
import { Before, After } from '..'
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
})
