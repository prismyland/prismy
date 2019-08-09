import { Selector } from '../types'

export const methodSelector: Selector<string | undefined> = ({ req }) => {
  return req.method
}
