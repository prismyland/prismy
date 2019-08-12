import { prismy, querySelector, res } from 'prismy'

export default prismy([querySelector], query => {
  return res(query)
})
