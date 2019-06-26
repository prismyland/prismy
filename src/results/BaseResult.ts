import { Context } from '../types'

export abstract class BaseResult {
  abstract handle(context: Context): any
}
