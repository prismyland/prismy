import { prismy, Query } from 'prismy'

export class MyHandler {
  async execute(@Query() query: any) {
    return query
  }
}

export default prismy(MyHandler)
