import { SyncSelector } from '../types'

export const nowBodySelector: SyncSelector<any> = ({ req }) => (req as any).body
