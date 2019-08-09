import { SyncSelector } from '../types'

export const methodSelector: SyncSelector<string | undefined> = ({ req }) => {
  return req.method
}
