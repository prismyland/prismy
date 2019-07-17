import { prismy, Query } from 'prismy'

export class MyHandler {
  async handle(@Query() query: any) {
    return query
  }
}

export default prismy(MyHandler)
