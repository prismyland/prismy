import {
  prismy,
  createInjectDecorators,
  getSelectors,
  Selector
} from '../results'

describe('createInjectDecorators', () => {
  it('sets a selector.', () => {
    const selectUrl: Selector<string | undefined> = req => req.url
    const StringUrl = createInjectDecorators(selectUrl)
    class MyHandler {
      execute(@StringUrl url: string) {
        return {
          url
        }
      }
    }

    const selectors = getSelectors(MyHandler)
    expect(selectors).toEqual([selectUrl])
  })

  it('throws when inject decorator is applied to other methods.', () => {
    expect(() => {
      const StringUrl = createInjectDecorators(req => req.url)
      class MyHandler {
        test(@StringUrl url: string) {
          return {
            url
          }
        }
        execute() {
          return {}
        }
      }
      prismy(MyHandler)
    }).toThrowError()
  })
})
