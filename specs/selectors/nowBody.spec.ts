import got from 'got'
import { testHandler } from '../helpers'
import {
  nowBodySelector,
  prismy,
  res,
  PrismyPureMiddleware,
  createJsonBodySelector
} from '../../src'

describe('nowBodySelector', () => {
  it('select body from request', async () => {
    const bodyParseMiddleware: PrismyPureMiddleware = context => async next => {
      const jsonBodySelector = createJsonBodySelector()
      ;(context.req as any).body = await jsonBodySelector(context)
      return next()
    }
    const handler = prismy(
      [nowBodySelector],
      body => {
        return res(body)
      },
      [bodyParseMiddleware]
    )

    await testHandler(handler, async url => {
      const response = await got(url, {
        body: {
          message: 'Hello, World!'
        },
        json: true
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: {
          message: 'Hello, World!'
        }
      })
    })
  })
})
