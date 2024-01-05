import got from 'got'
import { testHandler } from '../helpers'
import {
  SearchParamSelector,
  SearchParamListSelector,
  prismy,
  res,
} from '../../src'
import { URLSearchParams } from 'url'

describe('SearchParamSelector', () => {
  it('selects a search param', async () => {
    const handler = prismy([SearchParamSelector('message')], (message) => {
      return res({ message })
    })

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        searchParams: { message: 'Hello, World!' },
        responseType: 'json',
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: { message: 'Hello, World!' },
      })
    })
  })

  it('selects null if there is no param with the name', async () => {
    const handler = prismy([SearchParamSelector('message')], (message) => {
      return res({ message })
    })

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        responseType: 'json',
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: { message: null },
      })
    })
  })
})

describe('SearchParamListSelector', () => {
  it('selects a search param list', async () => {
    const handler = prismy([SearchParamListSelector('message')], (messages) => {
      return res({ messages })
    })

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        searchParams: new URLSearchParams([
          ['message', 'Hello, World!'],
          ['message', 'Have a nice day!'],
        ]),
        responseType: 'json',
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: { messages: ['Hello, World!', 'Have a nice day!'] },
      })
    })
  })

  it('selects null if there is no param with the name', async () => {
    const handler = prismy([SearchParamListSelector('message')], (messages) => {
      return res({ messages })
    })

    await testHandler(handler, async (url) => {
      const response = await got(url, {
        responseType: 'json',
      })

      expect(response).toMatchObject({
        statusCode: 200,
        body: { messages: [] },
      })
    })
  })
})
