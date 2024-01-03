import { prismy, res, router } from 'prismy'

export const rootHandler = prismy([], () => {
  return res(
    [
      '<!DOCTYPE html>',
      '<body>',
      '<h1>Root Page</h1>',
      '<a href="/test">Go to /test</a>',
      '</body>',
    ].join('')
  )
})

const testHandler = prismy([], () => {
  return res(
    [
      '<!DOCTYPE html>',
      '<body>',
      '<h1>Test Page</h1>',
      '<a href="/">Go to Root</a>',
      '</body>',
    ].join('')
  )
})

const myRouter = router([
  ['/', rootHandler],
  [['/test', 'get'], testHandler],
])

export default myRouter
