import { prismy, injectQuery } from 'prismy'

export class MyHandler {
  async execute(@injectQuery() query: any) {
    return query
  }
}

export default prismy(MyHandler)
