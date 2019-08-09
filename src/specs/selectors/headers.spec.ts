import got from 'got'
import { headersSelector } from '../../selectors'
import { testHandler } from '../../testHandler'
import { prismy } from '../../prismy'
import { res } from '../../utils'

describe('headersSelector', () => {
  it('select headers', async () => {
    const handler = prismy([headersSelector], headers => {
      return res(headers['x-test'])
    })

    await testHandler(handler, async url => {
      const response = await got(url, {
        headers: {
          'x-test': 'Hello, World!'
        }
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: 'Hello, World!'
      })
    })
  })
})
